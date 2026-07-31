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
    // Query knowledge base for relevant context
    const knowledge = await queryDentistKnowledge(
      dentistData.fields.DentistID,
      message,
      5
    );

    const context = knowledge
      .map((k) => `${k.title}: ${k.text}`)
      .join("\n\n");

    const fullPrompt = `${SYSTEM_PROMPT}

CLINIC INFORMATION:
Clinic: ${dentistData.fields.ClinicName}
Working Hours: ${dentistData.fields.WorkingHours || "9 AM - 6 PM"}

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
        const tokens = JSON.parse(
          dentistData.fields.GoogleCalendarToken || "{}"
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
      await storeLearnedAnswer(
        dentistData.fields.DentistID,
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
