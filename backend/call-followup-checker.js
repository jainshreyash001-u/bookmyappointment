/**
 * call-followup-checker.js
 * ──────────────────────────────────────────────────────
 * Cron job that checks for pending voice call follow-ups
 * Runs every 15 minutes
 * 
 * Usage:
 *   node call-followup-checker.js
 * 
 * In Render:
 *   Schedule: */15 * * * *
 *   Command: node call-followup-checker.js
 */

require("dotenv").config();
const { checkPendingFollowUpCalls } = require("./services/call-followup");

async function run() {
  console.log(`[Call Checker] Running at ${new Date().toISOString()}`);
  try {
    await checkPendingFollowUpCalls();
    process.exit(0);
  } catch (err) {
    console.error("[Call Checker] Error:", err);
    process.exit(1);
  }
}

run();
