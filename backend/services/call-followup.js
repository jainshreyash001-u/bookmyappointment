/**
 * services/call-followup.js
 * ──────────────────────────────────────────────────
 * Logic for voice call follow-ups and auto-cancellations
 */

const { getUpcomingUnconfirmedAppointments, updateAppointment } = require("./airtable");
const { sendWhatsAppMessage } = require("./whatsapp");

async function checkPendingFollowUpCalls() {
  console.log("[FollowUp] Checking for unconfirmed slots...");
  const appointments = await getUpcomingUnconfirmedAppointments();
  const now = new Date();

  for (const appt of appointments) {
    const apptTime = new Date(appt.fields.DateTime);
    const diffMs = apptTime - now;
    const diffHrs = diffMs / (1000 * 60 * 60);

    // RULE 1: If 1 hour passes with no response to WhatsApp booking -> Trigger VAPI call (Pro Plan)
    if (diffHrs <= 24 && appt.fields.Status === 'pending_whatsapp') {
      console.log(`[FollowUp] 1 hour no-response detected for ${appt.fields.PatientName}. Triggering VAPI call...`);
      
      // MOCK: Simulate VAPI call attempt
      const callAnswered = false; // In a real system, from VAPI webhook
      
      if (!callAnswered) {
        console.log(`[FollowUp] VAPI Call not answered. Moving to PENDING_VOICE status.`);
        await updateAppointment(appt.id, { Status: "pending_voice" });
        
        // Notify the dentist (Pro Feature Alert)
        console.log(`[Alert] Appointment for ${appt.fields.PatientName} remains unconfirmed after VAPI call.`);
      } else {
         await updateAppointment(appt.id, { Status: "confirmed" });
      }
      continue;
    }

    // RULE 2: If still no-response and time is closing in (e.g. 6 hours before) -> Auto Cancel
    if (diffHrs <= 6 && diffHrs > 0 && (appt.fields.Status === 'pending_voice' || appt.fields.Status === 'pending_whatsapp')) {
      console.log(`[FollowUp] Final cutoff reached for ${appt.fields.PatientName}. Auto-cancelling.`);
      await updateAppointment(appt.id, { Status: "cancelled" });
      
      await sendWhatsAppMessage(
        appt.fields.PatientPhone,
        `⚠️ Your appointment for ${appt.fields.Service} has been cancelled due to no response. Please book again if needed.`
      );
      continue;
    }
  }
}

module.exports = {
  checkPendingFollowUpCalls,
};
