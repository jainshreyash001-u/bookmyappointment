/**
 * schedule-notification-cron.js
 * ──────────────────────────────────────────────────────────
 * Standalone cron script — run via:
 *   node schedule-notification-cron.js
 *
 * Schedule with crontab (runs every day at 11:59 PM):
 *   59 23 * * * cd /path/to/bookmyappointment/backend && node schedule-notification-cron.js
 *
 * Or deploy as a Render/Railway cron job hitting:
 *   POST /api/cron/send-schedules
 *   Header: x-api-key: <CRON_SECRET>
 */

require("dotenv").config();
const { sendAllScheduleNotifications } = require("./services/schedule-notification");

async function runScheduleNotifications() {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`[Schedule Notifications] Starting at ${new Date().toISOString()}`);
  console.log(`${"=".repeat(80)}\n`);

  try {
    const result = await sendAllScheduleNotifications();

    console.log(`\n${"=".repeat(80)}`);
    console.log(`[Schedule Notifications] Completed`);
    console.log(`  ✓ Sent: ${result.sent}`);
    console.log(`  ✗ Failed: ${result.failed}`);
    console.log(`${"=".repeat(80)}\n`);

    process.exit(0);
  } catch (err) {
    console.error("\n[Schedule Notifications] Fatal error:", err);
    process.exit(1);
  }
}

runScheduleNotifications();
