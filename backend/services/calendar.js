/**
 * services/calendar.js
 * Google Calendar integration
 */

const { google } = require("googleapis");

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

function getAuthUrl(dentistId) {
  const oauth2Client = getOAuthClient();
  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state: dentistId,
  });
}

async function exchangeCodeForTokens(code) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

function getCalendarClient(tokens) {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(tokens);
  return google.calendar({ version: "v3", auth: oauth2Client });
}

async function checkCalendarAvailability(tokens, dateTime, duration = 60) {
  try {
    const calendar = getCalendarClient(tokens);
    const startTime = new Date(dateTime);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        items: [{ id: "primary" }],
      },
    });

    const busy = response.data.calendars.primary.busy;
    return busy.length === 0; // True if no busy slots
  } catch (err) {
    console.error("[Calendar Check]", err.message);
    return true; // Fail open - allow booking if check fails
  }
}

async function bookAppointment(tokens, appointmentData) {
  try {
    const calendar = getCalendarClient(tokens);
    const startTime = new Date(appointmentData.dateTime);
    const endTime = new Date(startTime.getTime() + (appointmentData.duration || 60) * 60000);

    const event = {
      summary: `Appointment: ${appointmentData.service}`,
      description: `Patient: ${appointmentData.patientName}\nPhone: ${appointmentData.patientPhone}\nNotes: ${appointmentData.notes || ""}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "Asia/Kolkata",
      },
      attendees: [
        {
          email: appointmentData.patientPhone.replace(/[^0-9]/g, "") + "@appointments.bookmyappointment.com",
        },
      ],
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return { success: true, eventId: response.data.id };
  } catch (err) {
    console.error("[Book Appointment]", err.message);
    return { success: false, error: err.message };
  }
}

async function getUpcomingAppointments(tokens, days = 14) {
  try {
    const calendar = getCalendarClient(tokens);
    const now = new Date();
    const later = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: later.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: "startTime",
    });

    return response.data.items || [];
  } catch (err) {
    console.error("[Get Upcoming]", err.message);
    return [];
  }
}

async function deleteAppointment(tokens, eventId) {
  try {
    const calendar = getCalendarClient(tokens);
    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });
    return { success: true };
  } catch (err) {
    console.error("[Delete Appointment]", err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  getOAuthClient,
  getAuthUrl,
  exchangeCodeForTokens,
  getCalendarClient,
  checkCalendarAvailability,
  bookAppointment,
  getUpcomingAppointments,
  deleteAppointment,
};
