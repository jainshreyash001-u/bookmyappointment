/**
 * services/doctor-ai.js
 * Admin command parser and calendar leave sweep
 */

const Groq = require("groq-sdk");
const supabase = require("./supabaseClient");
const { getDentistById, getAppointmentsByDentist, updateAppointment } = require("./database");
const { checkCalendarAvailability, deleteAppointment } = require("./calendar");
const { sendWhatsAppMessage } = require("./whatsapp");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const { queryDentistKnowledge } = require("./knowledge");

/**
 * Processes messages from the dentist (the boss) with full clinic context
 */
async function processDoctorMessage(dentistId, messageText) {
  const dentist = await getDentistById(dentistId);
  if (!dentist) throw new Error("Clinic not found");

  const currentDateTime = new Date().toISOString();
  const currentDayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // Fetch appointments, Google Calendar events, and knowledge base context in parallel
  const [appointments, gEvents, knowledge] = await Promise.all([
    getAppointmentsByDentist(dentistId).catch(err => {
      console.error("[Doctor AI Appointments Fetch Error]", err.message);
      return [];
    }),
    (async () => {
      try {
        const tokens = dentist.googleCalendarToken || {};
        if (tokens && tokens.access_token) {
          const { getUpcomingAppointments } = require("./calendar");
          return await getUpcomingAppointments(tokens, 7); // check next 7 days
        }
      } catch (err) {
        console.error("[Doctor Google Calendar Context Error]", err.message);
      }
      return [];
    })(),
    queryDentistKnowledge(dentistId, messageText, 3).catch(err => {
      console.error("[Doctor AI Knowledge Error]", err.message);
      return [];
    })
  ]);

  const activeAppointments = appointments.filter(a => a.status !== "cancelled");
  const appointmentsContext = activeAppointments.map(a => {
    return `- Patient: ${a.patientName}, Phone: ${a.patientPhone}, Service: ${a.service}, Time: ${new Date(a.dateTime).toLocaleString()}, Status: ${a.status}`;
  }).join("\n");

  const googleEventsContext = gEvents.map(e => {
    const start = e.start.dateTime || e.start.date;
    return `- Event: ${e.summary}, Time: ${new Date(start).toLocaleString()}`;
  }).join("\n");

  const knowledgeContext = knowledge.map((k) => `- ${k.title}: ${k.content || k.text}`).join("\n");

  const prompt = `You are Ressa, the dedicated AI receptionist and personal clinic assistant for Dr. ${dentist.name || "Smile"} at ${dentist.clinicName}.
You are speaking directly to Dr. ${dentist.name || "Smile"} (your boss).

Current Date/Time: ${currentDateTime} (Day: ${currentDayOfWeek}, Year: 2026)

CLINIC INFORMATION:
- Clinic Name: ${dentist.clinicName}
- Working Hours: ${typeof dentist.workingHours === "object" ? JSON.stringify(dentist.workingHours) : (dentist.workingHours || "9 AM - 6 PM")}
- Address: ${dentist.clinicAddress || "Main Location"}

CLINIC KNOWLEDGE BASE:
${knowledgeContext || "No specific guidelines recorded."}

CURRENT ACTIVE APPOINTMENTS:
${appointmentsContext || "No upcoming active appointments scheduled."}

DIRECT GOOGLE CALENDAR EVENTS (Includes personal/external blocks):
${googleEventsContext || "No external events found in the next 7 days."}

INSTRUCTIONS:
1. Address the doctor respectfully as Dr. ${dentist.name || "Smile"}.
2. You can answer questions about their schedule, appointments list, clinic hours, pricing, or guidelines.
3. Detect if the doctor is taking leave/vacation or blocking slot availability. If so, identify the leave window (tomorrow means the day after Current Date/Time).
4. Return ONLY a valid JSON response:
{
  "message": "Your helpful response to the doctor",
  "isLeaveRequest": true/false,
  "leaveStart": "ISO 8601 string representing start of leave or null",
  "leaveEnd": "ISO 8601 string representing end of leave or null",
  "reason": "Brief reason for leave/block or null"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt + `\n\nDoctor's Message: "${messageText}"` }],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    return parsed;
  } catch (err) {
    console.error("[Doctor AI Processing Error]", err);
    return {
      message: "I'm sorry Dr. " + (dentist.name || "Smile") + ", I encountered an error processing your request. Please try again.",
      isLeaveRequest: false,
      leaveStart: null,
      leaveEnd: null,
      reason: null,
    };
  }
}

/**
 * Helper to generate next available slots for a dentist
 */
async function findAlternativeSlots(dentist, count = 3) {
  const dentistId = dentist.id;
  const tokens = dentist.googleCalendarToken || {};
  
  // Parse working hours
  let workingHours = { start: 10, end: 18 }; // Default 10 AM to 6 PM
  try {
    const wh = dentist.workingHours || {};
    if (wh.hours) {
      // e.g. "Mon-Sat: 10AM - 8PM"
      const match = wh.hours.match(/(\d+)\s*(AM|PM)\s*-\s*(\d+)\s*(AM|PM)/i);
      if (match) {
        let startHr = parseInt(match[1]);
        if (match[2].toUpperCase() === "PM" && startHr < 12) startHr += 12;
        let endHr = parseInt(match[3]);
        if (match[4].toUpperCase() === "PM" && endHr < 12) endHr += 12;
        workingHours.start = startHr;
        workingHours.end = endHr;
      }
    }
  } catch (err) {
    console.warn("[Doctor AI] Could not parse working hours, using default 10AM-6PM", err.message);
  }

  const slots = [];
  let checkDate = new Date();
  checkDate.setDate(checkDate.getDate() + 1); // Start checking from tomorrow

  // Fetch all existing database appointments to prevent double booking
  const dbAppts = await getAppointmentsByDentist(dentistId);
  const activeApptTimes = new Set(
    dbAppts
      .filter((a) => a.status !== "cancelled" && a.status !== "rescheduling")
      .map((a) => new Date(a.dateTime).toISOString())
  );

  // Look ahead up to 14 days to find slots
  for (let d = 0; d < 14; d++) {
    const dayOfWeek = checkDate.getDay();
    if (dayOfWeek === 0) { // Skip Sundays
      checkDate.setDate(checkDate.getDate() + 1);
      continue;
    }

    // Generate hourly slots within working hours
    for (let hr = workingHours.start; hr < workingHours.end; hr++) {
      if (slots.length >= count) break;

      const slotTime = new Date(checkDate);
      slotTime.setHours(hr, 0, 0, 0);
      const isoSlot = slotTime.toISOString();

      // Check DB conflict
      if (activeApptTimes.has(isoSlot)) {
        continue;
      }

      // Check Google Calendar if connected
      if (tokens.access_token) {
        const isFree = await checkCalendarAvailability(tokens, isoSlot, 60);
        if (!isFree) {
          continue;
        }
      }

      slots.push(slotTime);
    }

    if (slots.length >= count) break;
    checkDate.setDate(checkDate.getDate() + 1);
  }

  return slots;
}

/**
 * Sweeps appointments in a date range, updates status, and notifies patients
 */
async function processLeaveAndReschedule(dentistId, leaveStart, leaveEnd) {
  const dentist = await getDentistById(dentistId);
  if (!dentist) throw new Error("Clinic not found");

  const tokens = dentist.googleCalendarToken || {};

  // Fetch all clinic appointments
  const allAppts = await getAppointmentsByDentist(dentistId);

  const start = new Date(leaveStart);
  const end = new Date(leaveEnd);

  // Filter affected appointments
  const affected = allAppts.filter((a) => {
    const apptTime = new Date(a.dateTime);
    const isActive = a.status !== "cancelled" && a.status !== "rescheduling";
    return isActive && apptTime >= start && apptTime <= end;
  });

  if (affected.length === 0) {
    return { count: 0, message: "No appointments affected by this leave." };
  }

  const results = [];
  const { updateCalendarEvent } = require("./calendar");

  for (const appt of affected) {
    const apptTime = new Date(appt.dateTime);
    const timeDiff = apptTime.getTime() - Date.now();
    const isMoreThan48Hours = timeDiff > (48 * 60 * 60 * 1000);

    // 1. Copy details and mark status as 'rescheduling' in DB with tracking metadata
    const tracking = {
      sentAt: new Date().toISOString(),
      calledAt: null,
      isMoreThan48Hours: isMoreThan48Hours,
      isShortNotice: !isMoreThan48Hours,
      firstContactAttempted: false
    };
    const originalDetails = `Original Appointment: ${apptTime.toLocaleString()}. Rescheduled due to doctor leave.`;
    const updatedNotes = `[RESCHEDULE_TRACKING] ${JSON.stringify(tracking)}\n\n[System Copy] ${originalDetails}\n${appt.notes || ""}`;

    await updateAppointment(appt.id, { 
      status: "rescheduling",
      notes: updatedNotes
    });

    // 2. Instead of deleting, update the event on Google Calendar to keep a copy
    if (appt.eventId && tokens.access_token) {
      try {
        await updateCalendarEvent(tokens, appt.eventId, {
          service: `[TO RESCHEDULE] ${appt.service || "Consultation"}`,
          patientName: appt.patientName,
          patientPhone: appt.patientPhone,
          dateTime: appt.dateTime,
          duration: appt.duration || 60,
          notes: `Original Time: ${appt.dateTime}. Flagged for rescheduling due to doctor leave.`,
        });
      } catch (calErr) {
        console.error(`[Doctor AI] Failed to update calendar event for appt ${appt.id}:`, calErr.message);
      }
    }

    // Only send the WhatsApp reschedule proposal immediately for long-notice appointments (> 48h)
    // Short-notice appointments are called first in the background worker
    if (isMoreThan48Hours) {
      // 3. Find 3 alternative slots
      const altSlots = await findAlternativeSlots(dentist, 3);
      
      // Format alternative slots
      const formattedSlots = altSlots.map((slot, idx) => {
        const dateStr = slot.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        const timeStr = slot.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        return `${idx + 1}️⃣ ${dateStr} at ${timeStr} (${slot.toISOString()})`;
      });

      const origDateStr = apptTime.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const origTimeStr = apptTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

      // 4. Send WhatsApp reschedule proposal
      const patientMsg = `📅 *Appointment Rescheduling Notice* 🦷\n\nDear ${appt.patientName},\n\nDr. ${dentist.name || "Smile"} will be on leave during your appointment scheduled for *${origDateStr} at ${origTimeStr}*.\n\nWe would love to reschedule you. Please reply with the number of your preferred slot:\n\n${formattedSlots.map(s => s.split(" (")[0]).join("\n")}\n\nOr reply with your preferred date/time and Ressa will help you book it. Thank you!`;

      await sendWhatsAppMessage(appt.patientPhone, patientMsg);

      // 5. Append this suggestion to the patient's conversation history in the database
      const { data: patient } = await supabase
        .from("patients")
        .select("conversation_history")
        .eq("dentist_id", dentistId)
        .eq("phone_number", appt.patientPhone)
        .maybeSingle();

      let history = [];
      if (patient && patient.conversation_history) {
        history = Array.isArray(patient.conversation_history) ? patient.conversation_history : [];
      }

      history.push({
        role: "assistant",
        content: `[SYSTEM AUTO-RESCHEDULE PROPOSAL SENT]:\n${patientMsg}\nAvailable ISO Options offered:\n${formattedSlots.join("\n")}`,
        timestamp: new Date().toISOString()
      });

      await supabase
        .from("patients")
        .upsert({
          dentist_id: dentistId,
          phone_number: appt.patientPhone,
          conversation_history: history,
          last_contact: new Date().toISOString()
        }, { onConflict: "dentist_id,phone_number" });
    }

    results.push({
      patient: appt.patientName,
      phone: appt.patientPhone,
      originalTime: appt.dateTime
    });
  }

  return {
    count: affected.length,
    affectedAppointments: results
  };
}

async function triggerVoiceCall(phone, name) {
  // Outbound call integration point (e.g. Twilio Voice API)
  console.log(`[ESCALATION VOICE API] Initiated call to ${name} (${phone}). Status: No Answer.`);
  return { success: true };
}

async function processRescheduleEscalations() {
  const supabase = require("./supabaseClient");
  const { updateAppointment } = require("./database");
  const { deleteAppointment } = require("./calendar");
  const { sendWhatsAppMessage } = require("./whatsapp");

  // Fetch all appointments in 'rescheduling' status
  const { data: appts, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("status", "rescheduling");

  if (error || !appts) return;

  const now = Date.now();
  const currentHour = new Date().getHours(); // local server hour

  for (const appt of appts) {
    if (!appt.notes) continue;
    
    // Parse tracking metadata
    const match = appt.notes.match(/\[RESCHEDULE_TRACKING\]\s*(\{.*?\})/);
    if (!match) continue;

    try {
      const tracking = JSON.parse(match[1]);

      // Check if patient responded since sentAt
      const { data: patient } = await supabase
        .from("patients")
        .select("last_contact, conversation_history")
        .eq("dentist_id", appt.dentist_id)
        .eq("phone_number", appt.patient_phone)
        .maybeSingle();

      const lastContactTime = patient && patient.last_contact ? new Date(patient.last_contact).getTime() : 0;
      const sentTime = new Date(tracking.sentAt).getTime();

      // If the patient has replied since the notice was sent, they responded! Do not escalate.
      if (lastContactTime > sentTime) {
        continue;
      }

      // ==========================================
      // FLOW A: LONG-NOTICE APPOINTMENT (> 48 HOURS AHEAD)
      // ==========================================
      if (tracking.isMoreThan48Hours) {
        // 1. Check if patient has not responded for more than 24 hours
        if (now - sentTime > 24 * 60 * 60 * 1000) {
          if (!tracking.calledAt) {
            // Must call between 12 PM and 8 PM
            if (currentHour >= 12 && currentHour < 20) {
              console.log(`[ESCALATION] Outbound call due to 24h silence: ${appt.patient_name} (${appt.patient_phone})`);
              await triggerVoiceCall(appt.patient_phone, appt.patient_name);

              // Update tracking metadata
              tracking.calledAt = new Date().toISOString();
              const newNotes = appt.notes.replace(/\[RESCHEDULE_TRACKING\]\s*(\{.*?\})/, `[RESCHEDULE_TRACKING] ${JSON.stringify(tracking)}`);
              await updateAppointment(appt.id, { notes: newNotes });
            }
            continue;
          }

          // 2. If called, check if another 24 hours have passed since the call with no response (48h total)
          const callTime = new Date(tracking.calledAt).getTime();
          if (now - callTime > 24 * 60 * 60 * 1000) {
            console.log(`[ESCALATION] Cancelling appointment for ${appt.patient_name} due to 48hr total silence.`);

            // Cancel the appointment in DB
            await updateAppointment(appt.id, { status: "cancelled" });

            // Delete from Google Calendar if sync exists
            if (appt.event_id) {
              const { getDentistById } = require("./database");
              const dentist = await getDentistById(appt.dentist_id);
              if (dentist) {
                const tokens = dentist.googleCalendarToken || {};
                if (tokens.access_token) {
                  await deleteAppointment(tokens, appt.event_id);
                }
              }
            }

            // Send WhatsApp cancel message
            const cancelMsg = `Dear ${appt.patient_name}, your appointment has been canceled because the doctor is not available at that particular time and you didn't respond in the past 48 hours. Would you like to schedule another appointment?`;
            await sendWhatsAppMessage(appt.patient_phone, cancelMsg);

            // Append cancellation message to patient conversation history
            let history = [];
            if (patient && patient.conversation_history) {
              history = Array.isArray(patient.conversation_history) ? patient.conversation_history : [];
            }
            history.push({
              role: "assistant",
              content: `[SYSTEM ESCALATION CANCELLATION SENT]:\n${cancelMsg}`,
              timestamp: new Date().toISOString()
            });

            await supabase
              .from("patients")
              .upsert({
                dentist_id: appt.dentist_id,
                phone_number: appt.patient_phone,
                conversation_history: history,
                last_contact: new Date().toISOString()
              }, { onConflict: "dentist_id,phone_number" });
          }
        }
      }

      // ==========================================
      // FLOW B: SHORT-NOTICE APPOINTMENT (WITHIN 24 HOURS OR NEXT DAY)
      // ==========================================
      else if (tracking.isShortNotice) {
        // 1. Initial contact: Call them first (between 12 PM and 8 PM)
        if (!tracking.calledAt) {
          if (currentHour >= 12 && currentHour < 20) {
            console.log(`[ESCALATION] Outbound call (short-notice first contact): ${appt.patient_name} (${appt.patient_phone})`);
            await triggerVoiceCall(appt.patient_phone, appt.patient_name);

            // "if the patient does not respond to call message them."
            // Assuming no answer / no response, we immediately send the WhatsApp reschedule request
            const rescheduleMsg = `📅 *Important Rescheduling Notice* 🦷\n\nDear ${appt.patient_name},\n\nDr. Smile is on leave during your upcoming appointment scheduled for tomorrow/today. We tried calling you to coordinate rescheduling. Please reply here with your preferred date and time, and Ressa will reschedule you immediately. Thank you!`;
            await sendWhatsAppMessage(appt.patient_phone, rescheduleMsg);

            // Append notice message to patient conversation history
            let history = [];
            if (patient && patient.conversation_history) {
              history = Array.isArray(patient.conversation_history) ? patient.conversation_history : [];
            }
            history.push({
              role: "assistant",
              content: `[SYSTEM SHORT-NOTICE CALL FAILED & MESSAGE SENT]:\n${rescheduleMsg}`,
              timestamp: new Date().toISOString()
            });

            await supabase
              .from("patients")
              .upsert({
                dentist_id: appt.dentist_id,
                phone_number: appt.patient_phone,
                conversation_history: history,
                last_contact: new Date().toISOString()
              }, { onConflict: "dentist_id,phone_number" });

            // Update tracking metadata
            tracking.calledAt = new Date().toISOString();
            tracking.firstContactAttempted = true;
            const newNotes = appt.notes.replace(/\[RESCHEDULE_TRACKING\]\s*(\{.*?\})/, `[RESCHEDULE_TRACKING] ${JSON.stringify(tracking)}`);
            await updateAppointment(appt.id, { notes: newNotes });
          }
          continue;
        }

        // 2. Cancel after 24 hours of silence since call/message
        const callTime = new Date(tracking.calledAt).getTime();
        if (now - callTime > 24 * 60 * 60 * 1000) {
          console.log(`[ESCALATION] Cancelling short-notice appointment for ${appt.patient_name} due to 24hr silence.`);

          // Cancel the appointment in DB
          await updateAppointment(appt.id, { status: "cancelled" });

          // Delete from Google Calendar if sync exists
          if (appt.event_id) {
            const { getDentistById } = require("./database");
            const dentist = await getDentistById(appt.dentist_id);
            if (dentist) {
              const tokens = dentist.googleCalendarToken || {};
              if (tokens.access_token) {
                await deleteAppointment(tokens, appt.event_id);
              }
            }
          }

          // Send WhatsApp cancel message
          const cancelMsg = `Dear ${appt.patient_name}, your appointment has been cancelled because the doctor is not available at particular time. Do you wan to book another appointment?`;
          await sendWhatsAppMessage(appt.patient_phone, cancelMsg);

          // Append cancellation message to patient conversation history
          let history = [];
          if (patient && patient.conversation_history) {
            history = Array.isArray(patient.conversation_history) ? patient.conversation_history : [];
          }
          history.push({
            role: "assistant",
            content: `[SYSTEM ESCALATION CANCELLATION SENT]:\n${cancelMsg}`,
            timestamp: new Date().toISOString()
          });

          await supabase
            .from("patients")
            .upsert({
              dentist_id: appt.dentist_id,
              phone_number: appt.patient_phone,
              conversation_history: history,
              last_contact: new Date().toISOString()
            }, { onConflict: "dentist_id,phone_number" });
        }
      }
    } catch (parseErr) {
      console.error("[Escalation Parser Error]", parseErr.message);
    }
  }
}

module.exports = {
  processDoctorMessage,
  findAlternativeSlots,
  processLeaveAndReschedule,
  triggerVoiceCall,
  processRescheduleEscalations
};
