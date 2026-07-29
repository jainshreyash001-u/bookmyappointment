/**
 * services/airtable.js
 * ──────────────────────────────────────────────────
 * Airtable operations for master database
 */

const Airtable = require("airtable");
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

// ─── DENTISTS ─────────────────────────────────────────────────
async function createDentist(data) {
  const records = await base(process.env.AIRTABLE_DENTISTS_TABLE || "Dentists").create([
    { fields: data },
  ]);
  return records[0];
}

async function getDentistById(dentistId) {
  const records = await base(process.env.AIRTABLE_DENTISTS_TABLE || "Dentists")
    .select({
      filterByFormula: `{DentistID} = '${dentistId}'`,
      maxRecords: 1,
    })
    .firstPage();
  return records[0] || null;
}

async function getDentistByEmail(email) {
  const records = await base(process.env.AIRTABLE_DENTISTS_TABLE || "Dentists")
    .select({
      filterByFormula: `{Email} = '${email}'`,
      maxRecords: 1,
    })
    .firstPage();
  return records[0] || null;
}

async function getDentistByWhatsAppNumber(number) {
  const records = await base(process.env.AIRTABLE_DENTISTS_TABLE || "Dentists")
    .select({
      filterByFormula: `{WhatsAppNumber} = '${number}'`,
      maxRecords: 1,
    })
    .firstPage();
  return records[0] || null;
}

async function updateDentist(recordId, fields) {
  const records = await base(process.env.AIRTABLE_DENTISTS_TABLE || "Dentists").update([
    { id: recordId, fields },
  ]);
  return records[0];
}

// ─── PATIENTS ─────────────────────────────────────────────────
async function upsertPatient(dentistId, phoneNumber, patientData) {
  const existing = await base(process.env.AIRTABLE_PATIENTS_TABLE || "Patients")
    .select({
      filterByFormula: `AND({DentistID} = '${dentistId}', {PhoneNumber} = '${phoneNumber}')`,
      maxRecords: 1,
    })
    .firstPage();

  if (existing.length > 0) {
    await base(process.env.AIRTABLE_PATIENTS_TABLE || "Patients").update([
      {
        id: existing[0].id,
        fields: {
          ...patientData,
          LastContact: new Date().toISOString(),
        },
      },
    ]);
    return existing[0];
  } else {
    const records = await base(process.env.AIRTABLE_PATIENTS_TABLE || "Patients").create([
      {
        fields: {
          DentistID: dentistId,
          PhoneNumber: phoneNumber,
          CreatedAt: new Date().toISOString(),
          ...patientData,
        },
      },
    ]);
    return records[0];
  }
}

async function getPatient(dentistId, phoneNumber) {
  const records = await base(process.env.AIRTABLE_PATIENTS_TABLE || "Patients")
    .select({
      filterByFormula: `AND({DentistID} = '${dentistId}', {PhoneNumber} = '${phoneNumber}')`,
      maxRecords: 1,
    })
    .firstPage();
  return records[0] || null;
}

// ─── APPOINTMENTS ─────────────────────────────────────────────
async function createAppointment(dentistId, appointmentData) {
  const records = await base(
    process.env.AIRTABLE_APPOINTMENTS_TABLE || "Appointments"
  ).create([
    {
      fields: {
        DentistID: dentistId,
        CreatedAt: new Date().toISOString(),
        Status: "pending_confirmation",
        ...appointmentData,
      },
    },
  ]);
  return records[0];
}

async function getAppointmentsByDentist(dentistId) {
  const records = await base(
    process.env.AIRTABLE_APPOINTMENTS_TABLE || "Appointments"
  )
    .select({
      filterByFormula: `{DentistID} = '${dentistId}'`,
      sort: [{ field: "DateTime", direction: "asc" }],
    })
    .all();
  return records;
}

async function getPendingReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const records = await base(
    process.env.AIRTABLE_APPOINTMENTS_TABLE || "Appointments"
  )
    .select({
      filterByFormula: `AND({Status} = 'confirmed', NOT({ReminderSent}), IS_AFTER({DateTime}, '${tomorrow.toISOString()}'), IS_BEFORE({DateTime}, '${tomorrowEnd.toISOString()}'))`,
    })
    .all();
  return records;
}

async function markReminderSent(recordId) {
  await base(process.env.AIRTABLE_APPOINTMENTS_TABLE || "Appointments").update([
    { id: recordId, fields: { ReminderSent: true } },
  ]);
}

async function updateAppointment(recordId, fields) {
  const records = await base(process.env.AIRTABLE_APPOINTMENTS_TABLE || "Appointments").update([
    { id: recordId, fields },
  ]);
  return records[0];
}

async function getUpcomingUnconfirmedAppointments() {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const records = await base(process.env.AIRTABLE_APPOINTMENTS_TABLE || "Appointments")
    .select({
      filterByFormula: `AND({Status} = 'pending_confirmation', IS_AFTER({DateTime}, '${now.toISOString()}'), IS_BEFORE({DateTime}, '${next24h.toISOString()}'))`,
    })
    .all();
  return records;
}

module.exports = {
  createDentist,
  getDentistById,
  getDentistByEmail,
  getDentistByWhatsAppNumber,
  updateDentist,
  upsertPatient,
  getPatient,
  createAppointment,
  getAppointmentsByDentist,
  getPendingReminders,
  markReminderSent,
  updateAppointment,
  getUpcomingUnconfirmedAppointments,
};
