/**
 * services/ai-brain.js
 * Groq LLM + Supabase RAG - The AI Brain
 */

const Groq = require("groq-sdk");
const { queryDentistKnowledge, storeLearnedAnswer } = require("./knowledge");
const { checkCalendarAvailability } = require("./calendar");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Ressa, the friendly and professional AI receptionist for a dental clinic. Your role is to help patients book appointments, answer questions about services, and coordinate/reschedule appointments.

IMPORTANT RULES:
1. Always introduce yourself as Ressa if asked.
2. Always be helpful and professional.
3. If the patient wants to book, extract: service, preferred date/time, patient name, and phone.
4. If you don't know something, say "I'll check with the dentist and get back to you".
5. If the patient agrees to a specific time slot (e.g. choosing a suggested option or saying "yes/confirm" to an available time), set "confirmed": true in "appointmentData".
6. If the patient proposes a custom preferred date/time (e.g. "Can I come next Friday at 4 PM instead?"), extract that slot in "appointmentData" with "confirmed": false (to check calendar availability).
7. If the system reports a conflict for their custom slot, politely coordinate with the patient to suggest alternative available slots.
8. Respond in the patient's language.
9. Be concise (max 100 words).

RESPONSE FORMAT - Return ONLY valid JSON:
{
  "message": "Your response to patient",
  "intent": "booking|inquiry|cancellation|rescheduling|confirmation|general",
  "sentiment": "positive|neutral|negative",
  "escalate": false,
  "escalateReason": "",
  "appointmentData": null or {
    "service": "service name",
    "dateTime": "2024-06-15T14:00:00Z",
    "duration": 60,
    "patientName": "name",
    "confirmed": false
  },
  "requestCalendarCheck": false
}`;

async function processMessage(dentistData, patientPhone, message) {
  try {
    const clinics = Array.isArray(dentistData) ? dentistData : [dentistData];
    const primaryClinic = clinics[0];

    const locationsInfo = clinics.map((c, index) => {
      const wh = typeof c.workingHours === "object" ? JSON.stringify(c.workingHours) : (c.workingHours || "9 AM - 6 PM");
      return `Clinic #${index + 1}:
- Name: ${c.clinicName}
- Address/Location: ${c.clinicAddress || "Main Location"}
- Working Hours: ${wh}`;
    }).join("\n\n");

    // Query knowledge base for relevant context across all clinics in parallel
    const knowledgePromises = clinics.map(async (clinic) => {
      const knowledge = await queryDentistKnowledge(
        clinic.dentistId,
        message,
        3
      ).catch(err => {
        console.error(`[Patient AI Knowledge Fetch Error for ${clinic.clinicName}]`, err.message);
        return [];
      });
      if (knowledge && knowledge.length > 0) {
        return `[Knowledge for ${clinic.clinicName} at ${clinic.clinicAddress || "Main Location"}]:\n` +
          knowledge.map((k) => `- ${k.title}: ${k.content || k.text}`).join("\n") + "\n\n";
      }
      return "";
    });

    const knowledgeResults = await Promise.all(knowledgePromises);
    const context = knowledgeResults.filter(Boolean).join("");

    const multiLocationInstruction = clinics.length > 1
      ? `\nCRITICAL: The patient is contacting a number linked to multiple clinic locations:
${locationsInfo}
If they haven't explicitly specified which clinic/location they want to book at (e.g. by clinic name or address/location), you MUST ask them:
"Would you like to book at ${clinics.map(c => c.clinicName + " (" + (c.clinicAddress || "Main Location") + ")").join(" or ")}?"
Do not assume or book until they specify.`
      : "";

    const primaryWh = typeof primaryClinic.workingHours === "object" ? JSON.stringify(primaryClinic.workingHours) : (primaryClinic.workingHours || "9 AM - 6 PM");
    const fullPrompt = `${SYSTEM_PROMPT}${multiLocationInstruction}

CLINIC INFORMATION:
${clinics.length === 1 ? `Clinic: ${primaryClinic.clinicName}\nWorking Hours: ${primaryWh}\nAddress: ${primaryClinic.clinicAddress || "Main Location"}` : locationsInfo}

CLINIC KNOWLEDGE BASE:
${context || "No specific information available"}

Patient Message: ${message}`;

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: fullPrompt }],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    let response;
    try {
      response = JSON.parse(completion.choices[0].message.content);
    } catch {
      response = {
        message: completion.choices[0].message.content,
        intent: "general",
        escalate: false,
      };
    }

    // If booking requested, validate and persist to database & calendar
    if (response.appointmentData && response.appointmentData.dateTime) {
      let selectedClinic = primaryClinic;
      try {
        if (clinics.length > 1) {
          const chosenText = ((response.appointmentData.service || "") + " " + (response.message || "")).toLowerCase();
          const matched = clinics.find(c =>
            chosenText.includes(c.clinicName.toLowerCase()) ||
            (c.clinicAddress && chosenText.includes(c.clinicAddress.toLowerCase()))
          );
          if (matched) selectedClinic = matched;
        }

        const dentistId = selectedClinic.dentistId;
        const tokens = selectedClinic.googleCalendarToken || {};

        // 1. Check Google Calendar availability
        let isAvailable = true;
        if (tokens.access_token) {
          isAvailable = await checkCalendarAvailability(
            tokens,
            response.appointmentData.dateTime,
            response.appointmentData.duration || 60
          );
        }

        if (!isAvailable) {
          const { findAlternativeSlots } = require("./doctor-ai");
          const altSlots = await findAlternativeSlots(selectedClinic, 3);
          const formattedSlots = altSlots.map((slot, idx) => {
            const dateStr = slot.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
            const timeStr = slot.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            return `${idx + 1}️⃣ ${dateStr} at ${timeStr}`;
          }).join("\n");

          response.message = `I apologize, but that slot is no longer available on our calendar. Let's find another time. Would any of these alternative slots work for you?\n\n${formattedSlots}`;
          response.appointmentData = null;
        } else if (response.appointmentData.confirmed) {
          // AI marked it as confirmed, let's book it!
          const { createAppointment, updateAppointment } = require("./database");
          const { bookAppointment } = require("./calendar");
          const supabase = require("./supabaseClient");

          // Concurrency check: Check if an active appointment already exists at the exact time
          const { data: dbConflicts } = await supabase
            .from("appointments")
            .select("id")
            .eq("dentist_id", dentistId)
            .eq("date_time", response.appointmentData.dateTime)
            .neq("status", "cancelled");

          if (dbConflicts && dbConflicts.length > 0) {
            throw new Error("slot_taken");
          }

          // Check if there is an existing rescheduling record to reuse
          const { data: oldRescheduling } = await supabase
            .from("appointments")
            .select("*")
            .eq("dentist_id", dentistId)
            .eq("patient_phone", patientPhone)
            .eq("status", "rescheduling")
            .limit(1);

          let reusedAppt = oldRescheduling && oldRescheduling.length > 0 ? oldRescheduling[0] : null;
          let eventId = null;

          if (reusedAppt && reusedAppt.event_id && tokens.access_token) {
            // Update/Move the existing Google Calendar event to the new slot (removes [TO RESCHEDULE])
            const { updateCalendarEvent } = require("./calendar");
            const calResult = await updateCalendarEvent(tokens, reusedAppt.event_id, {
              service: response.appointmentData.service || reusedAppt.service || "Consultation",
              patientName: response.appointmentData.patientName || reusedAppt.patient_name || "Patient",
              patientPhone: patientPhone,
              dateTime: response.appointmentData.dateTime,
              duration: response.appointmentData.duration || reusedAppt.duration || 60,
              notes: `Rescheduled successfully by Ressa. (Original Details saved in database notes).`,
            });
            if (calResult.success) {
              eventId = calResult.eventId;
            }
          }

          // If calendar event update failed or didn't exist, but tokens exist, book a new one
          if (!eventId && tokens.access_token) {
            const calResult = await bookAppointment(tokens, {
              patientName: response.appointmentData.patientName || (reusedAppt ? reusedAppt.patient_name : "Patient"),
              patientPhone: patientPhone,
              service: response.appointmentData.service || (reusedAppt ? reusedAppt.service : "Consultation"),
              dateTime: response.appointmentData.dateTime,
              duration: response.appointmentData.duration || 60,
              notes: "Booked automatically by Ressa",
            });
            if (calResult.success) {
              eventId = calResult.eventId;
            }
          }

          if (reusedAppt) {
            // Update the existing record instead of creating a new one
            await updateAppointment(reusedAppt.id, {
              dateTime: response.appointmentData.dateTime,
              status: "confirmed",
              eventId: eventId || reusedAppt.event_id,
              notes: (reusedAppt.notes || "") + `\n\n[System Update] Rescheduled to ${new Date(response.appointmentData.dateTime).toLocaleString()} by Ressa.`
            });
          } else {
            // Create new appointment record
            await createAppointment(dentistId, {
              patientName: response.appointmentData.patientName || "Patient",
              patientPhone: patientPhone,
              service: response.appointmentData.service || "Consultation",
              dateTime: response.appointmentData.dateTime,
              duration: response.appointmentData.duration || 60,
              status: "confirmed",
              notes: "Booked automatically by Ressa",
              eventId: eventId,
            });
          }

          // Clean up any remaining extra rescheduling rows for this patient
          const { data: remainingRescheduling } = await supabase
            .from("appointments")
            .select("id")
            .eq("dentist_id", dentistId)
            .eq("patient_phone", patientPhone)
            .eq("status", "rescheduling");

          if (remainingRescheduling && remainingRescheduling.length > 0) {
            for (const rem of remainingRescheduling) {
              if (reusedAppt && rem.id === reusedAppt.id) continue;
              await updateAppointment(rem.id, { status: "cancelled" });
            }
          }
        }
      } catch (err) {
        console.error("[Booking Execution Failed]", err.message);

        const { findAlternativeSlots } = require("./doctor-ai");
        const altSlots = await findAlternativeSlots(selectedClinic, 3);
        const formattedSlots = altSlots.map((slot, idx) => {
          const dateStr = slot.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
          const timeStr = slot.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
          return `${idx + 1}️⃣ ${dateStr} at ${timeStr}`;
        }).join("\n");

        response.message = `I apologize, but that slot was just booked by another patient! Let's find another time. Would any of these alternative slots work for you?\n\n${formattedSlots}`;
        response.appointmentData = null;
      }
    }

    // If escalate needed, store for learning
    if (response.escalate && response.escalateReason) {
      let selectedClinic = primaryClinic;
      if (clinics.length > 1) {
        const chosenText = (response.escalateReason || "").toLowerCase();
        const matched = clinics.find(c =>
          chosenText.includes(c.clinicName.toLowerCase()) ||
          (c.clinicAddress && chosenText.includes(c.clinicAddress.toLowerCase()))
        );
        if (matched) selectedClinic = matched;
      }

      await storeLearnedAnswer(
        selectedClinic.dentistId,
        message,
        response.escalateReason,
        "escalated"
      );
    }

    return response;
  } catch (err) {
    console.error("[AI Brain]", err.message);
    return {
      message:
        "I apologize, I'm having trouble processing your request. Please try again.",
      intent: "error",
      escalate: true,
      escalateReason: `Error: ${err.message}`,
    };
  }
}

async function transcribeAudio(audioBuffer) {
  try {
    const transcript = await groq.audio.transcriptions.create({
      file: audioBuffer,
      model: "whisper-large-v3",
    });

    return { success: true, text: transcript.text };
  } catch (err) {
    console.error("[Transcribe]", err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  processMessage,
  transcribeAudio,
};
