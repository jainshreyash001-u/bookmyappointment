/**
 * services/ai-brain.js
 * Groq LLM + Supabase RAG - The AI Brain
 */

const Groq = require("groq-sdk");
const { queryDentistKnowledge, storeLearnedAnswer } = require("./knowledge");
const { checkCalendarAvailability } = require("./calendar");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a friendly and professional AI assistant for a dental clinic. Your role is to help patients book appointments, answer questions about services, and provide information.

IMPORTANT RULES:
1. Always be helpful and professional
2. If patient wants to book, extract: service, preferred date/time, patient name, phone
3. If you don't know something, say "I'll check with the dentist and get back to you"
4. Always confirm appointments with patient
5. Respond in the patient's language
6. Be concise (max 100 words)

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
      return `Clinic #${index + 1}:
- Name: ${c.fields.ClinicName}
- Address/Location: ${c.fields.ClinicAddress || "Main Location"}
- Working Hours: ${c.fields.WorkingHours || "9 AM - 6 PM"}`;
    }).join("\n\n");

    // Query knowledge base for relevant context across all clinics
    let context = "";
    for (const clinic of clinics) {
      const knowledge = await queryDentistKnowledge(
        clinic.fields.DentistID,
        message,
        3
      );
      if (knowledge && knowledge.length > 0) {
        context += `[Knowledge for ${clinic.fields.ClinicName} at ${clinic.fields.ClinicAddress || "Main Location"}]:\n` +
          knowledge.map((k) => `- ${k.title}: ${k.content || k.text}`).join("\n") + "\n\n";
      }
    }

    const multiLocationInstruction = clinics.length > 1
      ? `\nCRITICAL: The patient is contacting a number linked to multiple clinic locations:
${locationsInfo}
If they haven't explicitly specified which clinic/location they want to book at (e.g. by clinic name or address/location), you MUST ask them:
"Would you like to book at ${clinics.map(c => c.fields.ClinicName + " (" + (c.fields.ClinicAddress || "Main Location") + ")").join(" or ")}?"
Do not assume or book until they specify.`
      : "";

    const fullPrompt = `${SYSTEM_PROMPT}${multiLocationInstruction}

CLINIC INFORMATION:
${clinics.length === 1 ? `Clinic: ${primaryClinic.fields.ClinicName}\nWorking Hours: ${primaryClinic.fields.WorkingHours || "9 AM - 6 PM"}\nAddress: ${primaryClinic.fields.ClinicAddress || "Main Location"}` : locationsInfo}

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

    // If booking requested, validate calendar
    if (response.appointmentData && response.appointmentData.dateTime) {
      try {
        let selectedClinic = primaryClinic;
        if (clinics.length > 1) {
          const chosenText = ((response.appointmentData.service || "") + " " + (response.message || "")).toLowerCase();
          const matched = clinics.find(c =>
            chosenText.includes(c.fields.ClinicName.toLowerCase()) ||
            (c.fields.ClinicAddress && chosenText.includes(c.fields.ClinicAddress.toLowerCase()))
          );
          if (matched) selectedClinic = matched;
        }

        const tokens = JSON.parse(
          selectedClinic.fields.GoogleCalendarToken || "{}"
        );
        if (tokens.access_token) {
          const isAvailable = await checkCalendarAvailability(
            tokens,
            response.appointmentData.dateTime,
            response.appointmentData.duration || 60
          );

          if (!isAvailable) {
            response.message +=
              "\n\nThat slot is not available. Please choose another time.";
            response.appointmentData = null;
          }
        }
      } catch (err) {
        console.error("[Calendar Check]", err.message);
      }
    }

    // If escalate needed, store for learning
    if (response.escalate && response.escalateReason) {
      let selectedClinic = primaryClinic;
      if (clinics.length > 1) {
        const chosenText = (response.escalateReason || "").toLowerCase();
        const matched = clinics.find(c =>
          chosenText.includes(c.fields.ClinicName.toLowerCase()) ||
          (c.fields.ClinicAddress && chosenText.includes(c.fields.ClinicAddress.toLowerCase()))
        );
        if (matched) selectedClinic = matched;
      }

      await storeLearnedAnswer(
        selectedClinic.fields.DentistID,
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
