/**
 * services/slack.js
 * Slack notifications & alerts
 */

const axios = require("axios");

async function sendSlackAlert(dentistData, alertData) {
  try {
    if (!dentistData.fields.SlackWebhook) {
      console.log("[Slack] No webhook configured");
      return { success: false, reason: "no_webhook" };
    }

    let message = {};

    if (alertData.type === "unknown_query") {
      message = {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "❓ Unknown Query Escalation",
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Patient:*\n${alertData.patientName}`,
              },
              {
                type: "mrkdwn",
                text: `*Phone:*\n${alertData.patientPhone}`,
              },
            ],
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Question:*\n${alertData.question}`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Action Required:* Please respond with the answer so the AI can learn for future queries.",
            },
          },
        ],
      };
    } else if (alertData.type === "new_booking") {
      message = {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "✅ New Appointment Booked",
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Patient:*\n${alertData.patientName}`,
              },
              {
                type: "mrkdwn",
                text: `*Service:*\n${alertData.service}`,
              },
              {
                type: "mrkdwn",
                text: `*Date & Time:*\n${alertData.dateTime}`,
              },
              {
                type: "mrkdwn",
                text: `*Phone:*\n${alertData.patientPhone}`,
              },
            ],
          },
        ],
      };
    }

    await axios.post(dentistData.fields.SlackWebhook, message);
    return { success: true };
  } catch (err) {
    console.error("[Slack Alert]", err.message);
    return { success: false, error: err.message };
  }
}

async function createDentistSlackInvite(dentistData) {
  // Returns the Slack app install URL
  // In production, create a custom OAuth flow
  return `https://slack.com/oauth_v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=incoming-webhook&redirect_uri=${process.env.BACKEND_URL}/api/slack/callback`;
}

module.exports = {
  sendSlackAlert,
  createDentistSlackInvite,
};
