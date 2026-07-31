/**
 * services/database.js
 * ──────────────────────────────────────────────────
 * Centralized Supabase database adapter.
 * Contains CRUD functions for Dentists, Patients, and Appointments.
 */

const supabase = require("./supabaseClient");

// ─── DENTISTS ─────────────────────────────────────────────────
async function createDentist(data) {
  const dbData = {
    dentist_id: data.DentistID,
    name: data.Name,
    email: data.Email,
    whatsapp_number: data.WhatsAppNumber,
    clinic_name: data.ClinicName,
    working_hours: data.WorkingHours ? JSON.parse(data.WorkingHours) : {},
    subscription_status: data.SubscriptionStatus || "trial",
    trial_ends_at: data.TrialEndsAt,
    slack_notification_mode: data.SlackNotificationMode,
    slack_webhook: data.SlackWebhook,
    google_calendar_token: data.GoogleCalendarToken ? JSON.parse(data.GoogleCalendarToken) : {},
    google_calendar_id: data.GoogleCalendarId || "primary",
    clinic_address: data.PasswordHash || data.ClinicAddress,
  };

  const { data: inserted, error } = await supabase
    .from("dentists")
    .insert([dbData])
    .select()
    .single();

  if (error) throw error;
  return mapDentistToAirtableFormat(inserted);
}

async function getDentistById(dentistId) {
  const { data, error } = await supabase
    .from("dentists")
    .select()
    .eq("dentist_id", dentistId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapDentistToAirtableFormat(data);
}

async function getDentistByEmail(email) {
  const { data, error } = await supabase
    .from("dentists")
    .select()
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapDentistToAirtableFormat(data);
}

async function getDentistByWhatsAppNumber(number) {
  const { data, error } = await supabase
    .from("dentists")
    .select()
    .eq("whatsapp_number", number)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapDentistToAirtableFormat(data);
}

async function updateDentist(recordId, fields) {
  const dbData = {};
  if (fields.Name !== undefined) dbData.name = fields.Name;
  if (fields.ClinicName !== undefined) dbData.clinic_name = fields.ClinicName;
  if (fields.WorkingHours !== undefined) {
    dbData.working_hours = typeof fields.WorkingHours === "string" 
      ? JSON.parse(fields.WorkingHours) 
      : fields.WorkingHours;
  }
  if (fields.ClinicAddress !== undefined) dbData.clinic_address = fields.ClinicAddress;
  if (fields.GoogleCalendarToken !== undefined) {
    dbData.google_calendar_token = typeof fields.GoogleCalendarToken === "string"
      ? JSON.parse(fields.GoogleCalendarToken)
      : fields.GoogleCalendarToken;
  }
  if (fields.GoogleCalendarId !== undefined) dbData.google_calendar_id = fields.GoogleCalendarId;
  if (fields.ClinicAddress !== undefined) dbData.clinic_address = fields.ClinicAddress;
  if (fields.PasswordHash !== undefined) dbData.clinic_address = fields.PasswordHash;
  if (fields.SubscriptionStatus !== undefined) dbData.subscription_status = fields.SubscriptionStatus;
  if (fields.TrialEndsAt !== undefined) dbData.trial_ends_at = fields.TrialEndsAt;
  if (fields.SlackWebhook !== undefined) dbData.slack_webhook = fields.SlackWebhook;
  if (fields.SlackNotificationMode !== undefined) dbData.slack_notification_mode = fields.SlackNotificationMode;

  const { data, error } = await supabase
    .from("dentists")
    .update(dbData)
    .eq("dentist_id", recordId)
    .select()
    .single();

  if (error) throw error;
  return mapDentistToAirtableFormat(data);
}

function mapDentistToAirtableFormat(row) {
  return {
    id: row.dentist_id,
    fields: {
      DentistID: row.dentist_id,
      Name: row.name,
      ClinicName: row.clinic_name,
      Email: row.email,
      WhatsAppNumber: row.whatsapp_number,
      ClinicAddress: row.clinic_address,
      PasswordHash: row.clinic_address,
      WorkingHours: JSON.stringify(row.working_hours || {}),
      SubscriptionStatus: row.subscription_status,
      TrialEndsAt: row.trial_ends_at,
      SlackNotificationMode: row.slack_notification_mode,
      SlackWebhook: row.slack_webhook,
      GoogleCalendarToken: JSON.stringify(row.google_calendar_token || {}),
      GoogleCalendarId: row.google_calendar_id,
    },
  };
}

// ─── PATIENTS ─────────────────────────────────────────────────
async function upsertPatient(dentistId, phoneNumber, patientData) {
  let conversationHistory = [];
  if (patientData.ConversationHistory) {
    try {
      conversationHistory = typeof patientData.ConversationHistory === "string"
        ? JSON.parse(patientData.ConversationHistory)
        : patientData.ConversationHistory;
    } catch {
      conversationHistory = [{ role: "user", content: patientData.ConversationHistory }];
    }
  }

  const dbData = {
    dentist_id: dentistId,
    phone_number: phoneNumber,
    name: patientData.Name || "Patient",
    email: patientData.Email || null,
    conversation_history: conversationHistory,
    last_contact: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("patients")
    .upsert(dbData, { onConflict: "dentist_id,phone_number" })
    .select()
    .single();

  if (error) throw error;
  return mapPatientToAirtableFormat(data);
}

async function getPatient(dentistId, phoneNumber) {
  const { data, error } = await supabase
    .from("patients")
    .select()
    .eq("dentist_id", dentistId)
    .eq("phone_number", phoneNumber)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapPatientToAirtableFormat(data);
}

function mapPatientToAirtableFormat(row) {
  return {
    id: row.id,
    fields: {
      DentistID: row.dentist_id,
      PhoneNumber: row.phone_number,
      Name: row.name,
      Email: row.email,
      ConversationHistory: JSON.stringify(row.conversation_history || []),
      LastContact: row.last_contact,
      CreatedAt: row.created_at,
    },
  };
}

// ─── APPOINTMENTS ─────────────────────────────────────────────
async function createAppointment(dentistId, appointmentData) {
  const dbData = {
    dentist_id: dentistId,
    patient_name: appointmentData.PatientName,
    patient_phone: appointmentData.PatientPhone,
    service: appointmentData.Service,
    date_time: appointmentData.DateTime,
    duration: appointmentData.Duration || 60,
    status: appointmentData.Status || "pending_confirmation",
    notes: appointmentData.Notes || "",
    event_id: appointmentData.EventID || null,
  };

  const { data, error } = await supabase
    .from("appointments")
    .insert([dbData])
    .select()
    .single();

  if (error) throw error;
  return mapAppointmentToAirtableFormat(data);
}

async function getAppointmentsByDentist(dentistId) {
  const { data, error } = await supabase
    .from("appointments")
    .select()
    .eq("dentist_id", dentistId)
    .order("date_time", { ascending: true });

  if (error) throw error;
  return (data || []).map(mapAppointmentToAirtableFormat);
}

async function getPendingReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("appointments")
    .select()
    .eq("status", "confirmed")
    .eq("reminder_sent", false)
    .gte("date_time", tomorrow.toISOString())
    .lte("date_time", tomorrowEnd.toISOString());

  if (error) throw error;
  return (data || []).map(mapAppointmentToAirtableFormat);
}

async function markReminderSent(recordId) {
  const { error } = await supabase
    .from("appointments")
    .update({ reminder_sent: true })
    .eq("id", recordId);

  if (error) throw error;
}

async function updateAppointment(recordId, fields) {
  const dbData = {};
  if (fields.Status !== undefined) dbData.status = fields.Status;
  if (fields.ReminderSent !== undefined) dbData.reminder_sent = fields.ReminderSent;
  if (fields.Notes !== undefined) dbData.notes = fields.Notes;
  if (fields.EventID !== undefined) dbData.event_id = fields.EventID;
  if (fields.DateTime !== undefined) dbData.date_time = fields.DateTime;
  if (fields.Duration !== undefined) dbData.duration = fields.Duration;
  if (fields.PatientName !== undefined) dbData.patient_name = fields.PatientName;
  if (fields.PatientPhone !== undefined) dbData.patient_phone = fields.PatientPhone;
  if (fields.Service !== undefined) dbData.service = fields.Service;

  const { data, error } = await supabase
    .from("appointments")
    .update(dbData)
    .eq("id", recordId)
    .select()
    .single();

  if (error) throw error;
  return mapAppointmentToAirtableFormat(data);
}

async function getUpcomingUnconfirmedAppointments() {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("appointments")
    .select()
    .eq("status", "pending_confirmation")
    .gte("date_time", now.toISOString())
    .lte("date_time", next24h.toISOString());

  if (error) throw error;
  return (data || []).map(mapAppointmentToAirtableFormat);
}

function mapAppointmentToAirtableFormat(row) {
  return {
    id: row.id,
    fields: {
      DentistID: row.dentist_id,
      PatientName: row.patient_name,
      PatientPhone: row.patient_phone,
      Service: row.service,
      DateTime: row.date_time,
      Duration: row.duration,
      Status: row.status,
      ReminderSent: row.reminder_sent,
      Notes: row.notes,
      EventID: row.event_id,
      CreatedAt: row.created_at,
    },
  };
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
