/**
 * services/schedule-notification.js
 * ──────────────────────────────────────────────────
 * Processing worker for sending automated appointment notifications and reminders.
 */

const { getPendingReminders, markReminderSent } = require("./database");
const { sendAppointmentReminder } = require("./whatsapp");

async function sendAllScheduleNotifications() {
  let sent = 0;
  let failed = 0;

  try {
    const appointments = await getPendingReminders();
    console.log(`[Schedule Notification] Found ${appointments.length} pending appointment reminders.`);

    for (const appt of appointments) {
      try {
        const phone = appt.patientPhone;
        const result = await sendAppointmentReminder(phone, {
          dateTime: appt.dateTime,
          service: appt.service,
        });

        if (result.success) {
          await markReminderSent(appt.id);
          console.log(`[Schedule Notification] Reminder sent successfully for appt ${appt.id} to ${phone}`);
          sent++;
        } else {
          console.error(`[Schedule Notification] Provider error for appt ${appt.id}:`, result.error);
          failed++;
        }
      } catch (innerErr) {
        console.error(`[Schedule Notification] Error processing appt ${appt.id}:`, innerErr.message);
        failed++;
      }
    }
  } catch (err) {
    console.error("[Schedule Notification] Failed to fetch reminders:", err.message);
    throw err;
  }

  return { sent, failed };
}

module.exports = {
  sendAllScheduleNotifications,
};
