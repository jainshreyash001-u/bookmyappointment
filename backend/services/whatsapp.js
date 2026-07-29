/**
 * services/whatsapp.js
 * Twilio & Meta WhatsApp integration
 */

const axios = require("axios");
const twilio = require("twilio");

async function sendWhatsAppMessage(phoneNumber, message) {
  try {
    if (process.env.TWILIO_ACCOUNT_SID) {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const response = await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${phoneNumber.replace(/[^0-9+]/g, "")}`,
        body: message,
      });

      return { success: true, messageId: response.sid };
    } else if (process.env.META_WHATSAPP_TOKEN) {
      const response = await axios.post(
        `https://graph.instagram.com/v18.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: phoneNumber.replace(/[^0-9]/g, ""),
          type: "text",
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
          },
        }
      );

      return { success: true, messageId: response.data.messages[0].id };
    }

    return { success: false, error: "No WhatsApp provider configured" };
  } catch (err) {
    console.error("[WhatsApp Send]", err.message);
    return { success: false, error: err.message };
  }
}

async function sendAppointmentReminder(phoneNumber, appointmentData) {
  const dateTime = new Date(appointmentData.dateTime);
  const timeString = dateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateString = dateTime.toLocaleDateString("en-US");

  const message = `📅 Appointment Reminder!\n\nService: ${appointmentData.service}\nDate: ${dateString}\nTime: ${timeString}\n\nReply:\n1️⃣ CONFIRM\n2️⃣ RESCHEDULE\n\nThank you! 🦷`;

  return sendWhatsAppMessage(phoneNumber, message);
}

async function sendWelcomeMessage(phoneNumber, clinicName) {
  const message = `🦷 Welcome to BookMyAppointment!\n\nYou can now book appointments at ${clinicName} directly on WhatsApp.\n\nJust send a message:\n"I want to book an appointment for cleaning next Monday at 2 PM"\n\nWe're here 24/7! 😊`;

  return sendWhatsAppMessage(phoneNumber, message);
}

module.exports = {
  sendWhatsAppMessage,
  sendAppointmentReminder,
  sendWelcomeMessage,
};
