/**
 * services/database.js
 * ──────────────────────────────────────────────────
 * Centralized Supabase database adapter.
 * Contains CRUD functions for Dentists, Patients, and Appointments.
 * Returns flat camelCase database records directly.
 */

const supabase = require("./supabaseClient");

// ─── DENTISTS ─────────────────────────────────────────────────
async function createDentistUser(email, passwordHash, name) {
  const { data, error } = await supabase
    .from("dentist_users")
    .insert([{ email, password_hash: passwordHash, name }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getDentistUserByEmail(email) {
  const { data, error } = await supabase
    .from("dentist_users")
    .select()
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function createDentist(data) {
  let ownerId = data.ownerId;
  if (!ownerId && data.email) {
    const existingUser = await getDentistUserByEmail(data.email);
    if (existingUser) {
      ownerId = existingUser.id;
    } else {
      const newUser = await createDentistUser(data.email, data.passwordHash, data.name || data.clinicName);
      ownerId = newUser.id;
    }
  }

  const dbData = {
    dentist_id: data.dentistId,
    owner_id: ownerId,
    name: data.name,
    clinic_name: data.clinicName,
    email: data.email,
    whatsapp_number: data.whatsappNumber,
    working_hours: data.workingHours ? (typeof data.workingHours === "string" ? JSON.parse(data.workingHours) : data.workingHours) : {},
    subscription_status: data.subscriptionStatus || "trial",
    trial_ends_at: data.trialEndsAt,
    slack_notification_mode: data.slackNotificationMode || "none",
    slack_webhook: data.slackWebhook,
    google_calendar_token: data.googleCalendarToken ? (typeof data.googleCalendarToken === "string" ? JSON.parse(data.googleCalendarToken) : data.googleCalendarToken) : {},
    google_calendar_id: data.googleCalendarId || "primary",
    clinic_address: data.clinicAddress,
  };

  const { data: inserted, error } = await supabase
    .from("dentists")
    .insert([dbData])
    .select()
    .single();

  if (error) throw error;
  return mapDentist(inserted);
}

async function getDentistById(dentistId) {
  const { data, error } = await supabase
    .from("dentists")
    .select("*, owner:dentist_users(*)")
    .eq("dentist_id", dentistId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  
  const mapped = mapDentist(data);
  if (data.owner) {
    mapped.passwordHash = data.owner.password_hash;
    mapped.doctorName = data.owner.name;
    mapped.ownerId = data.owner.id;
  }
  return mapped;
}

async function getClinicsByOwnerId(ownerId) {
  const { data, error } = await supabase
    .from("dentists")
    .select()
    .eq("owner_id", ownerId);

  if (error) throw error;
  return (data || []).map(mapDentist);
}

async function getDentistByEmail(email) {
  const user = await getDentistUserByEmail(email);
  if (!user) return null;

  const { data: clinic, error } = await supabase
    .from("dentists")
    .select()
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  const clinicRow = clinic || {
    dentist_id: null,
    name: user.name,
    clinic_name: null,
    email: user.email,
    whatsapp_number: null,
    clinic_address: null,
    working_hours: {}
  };

  const mapped = mapDentist(clinicRow);
  mapped.passwordHash = user.password_hash;
  mapped.doctorName = user.name;
  mapped.ownerId = user.id;
  return mapped;
}

async function getDentistByWhatsAppNumber(number) {
  const { data, error } = await supabase
    .from("dentists")
    .select()
    .eq("whatsapp_number", number)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapDentist(data);
}

async function getClinicsByWhatsAppNumber(number) {
  const { data, error } = await supabase
    .from("dentists")
    .select()
    .eq("whatsapp_number", number);

  if (error) throw error;
  return (data || []).map(mapDentist);
}

async function updateDentist(recordId, fields) {
  // If passwordHash or doctorName is updated, modify the dentist_users table
  if (fields.passwordHash !== undefined || fields.doctorName !== undefined) {
    const { data: clinic } = await supabase
      .from("dentists")
      .select("owner_id")
      .eq("dentist_id", recordId)
      .maybeSingle();
      
    if (clinic && clinic.owner_id) {
      const userUpdates = {};
      if (fields.passwordHash !== undefined) userUpdates.password_hash = fields.passwordHash;
      if (fields.doctorName !== undefined) userUpdates.name = fields.doctorName;
      
      await supabase
        .from("dentist_users")
        .update(userUpdates)
        .eq("id", clinic.owner_id);
    }
  }

  const dbData = {};
  if (fields.name !== undefined) dbData.name = fields.name;
  if (fields.clinicName !== undefined) dbData.clinic_name = fields.clinicName;
  if (fields.workingHours !== undefined) {
    dbData.working_hours = typeof fields.workingHours === "string" 
      ? JSON.parse(fields.workingHours) 
      : fields.workingHours;
  }
  if (fields.clinicAddress !== undefined) dbData.clinic_address = fields.clinicAddress;
  if (fields.googleCalendarToken !== undefined) {
    dbData.google_calendar_token = typeof fields.googleCalendarToken === "string"
      ? JSON.parse(fields.googleCalendarToken)
      : fields.googleCalendarToken;
  }
  if (fields.googleCalendarId !== undefined) dbData.google_calendar_id = fields.googleCalendarId;
  if (fields.subscriptionStatus !== undefined) dbData.subscription_status = fields.subscriptionStatus;
  if (fields.trialEndsAt !== undefined) dbData.trial_ends_at = fields.trialEndsAt;
  if (fields.slackWebhook !== undefined) dbData.slack_webhook = fields.slackWebhook;
  if (fields.slackNotificationMode !== undefined) dbData.slack_notification_mode = fields.slackNotificationMode;

  if (Object.keys(dbData).length === 0) {
    return await getDentistById(recordId);
  }

  const { data, error } = await supabase
    .from("dentists")
    .update(dbData)
    .eq("dentist_id", recordId)
    .select()
    .single();

  if (error) throw error;
  
  const mapped = mapDentist(data);
  if (fields.passwordHash !== undefined) mapped.passwordHash = fields.passwordHash;
  if (fields.doctorName !== undefined) mapped.doctorName = fields.doctorName;
  return mapped;
}

function mapDentist(row) {
  if (!row) return null;
  return {
    id: row.dentist_id,
    dentistId: row.dentist_id,
    name: row.name,
    clinicName: row.clinic_name,
    email: row.email,
    whatsappNumber: row.whatsapp_number,
    clinicAddress: row.clinic_address,
    passwordHash: null,
    workingHours: typeof row.working_hours === "string" ? JSON.parse(row.working_hours) : (row.working_hours || {}),
    subscriptionStatus: row.subscription_status,
    trialEndsAt: row.trial_ends_at,
    slackNotificationMode: row.slack_notification_mode,
    slackWebhook: row.slack_webhook,
    googleCalendarToken: typeof row.google_calendar_token === "string" ? JSON.parse(row.google_calendar_token) : (row.google_calendar_token || {}),
    googleCalendarId: row.google_calendar_id,
  };
}

// ─── PATIENTS ─────────────────────────────────────────────────
async function upsertPatient(dentistId, phoneNumber, patientData) {
  let conversationHistory = [];
  if (patientData.conversationHistory) {
    try {
      conversationHistory = typeof patientData.conversationHistory === "string"
        ? JSON.parse(patientData.conversationHistory)
        : patientData.conversationHistory;
    } catch {
      conversationHistory = [{ role: "user", content: patientData.conversationHistory }];
    }
  }

  const dbData = {
    dentist_id: dentistId,
    phone_number: phoneNumber,
    name: patientData.name || "Patient",
    email: patientData.email || null,
    conversation_history: conversationHistory,
    last_contact: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("patients")
    .upsert(dbData, { onConflict: "dentist_id,phone_number" })
    .select()
    .single();

  if (error) throw error;
  return mapPatient(data);
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
  return mapPatient(data);
}

function mapPatient(row) {
  if (!row) return null;
  return {
    id: row.id,
    dentistId: row.dentist_id,
    phoneNumber: row.phone_number,
    name: row.name,
    email: row.email,
    conversationHistory: typeof row.conversation_history === "string" ? JSON.parse(row.conversation_history) : (row.conversation_history || []),
    lastContact: row.last_contact,
    createdAt: row.created_at,
  };
}

// ─── APPOINTMENTS ─────────────────────────────────────────────
async function createAppointment(dentistId, appointmentData) {
  const dbData = {
    dentist_id: dentistId,
    patient_name: appointmentData.patientName,
    patient_phone: appointmentData.patientPhone,
    service: appointmentData.service,
    date_time: appointmentData.dateTime,
    duration: appointmentData.duration || 60,
    status: appointmentData.status || "pending_confirmation",
    notes: appointmentData.notes || "",
    event_id: appointmentData.eventId || null,
  };

  const { data, error } = await supabase
    .from("appointments")
    .insert([dbData])
    .select()
    .single();

  if (error) throw error;
  return mapAppointment(data);
}

async function getAppointmentsByDentist(dentistId) {
  const { data, error } = await supabase
    .from("appointments")
    .select()
    .eq("dentist_id", dentistId)
    .order("date_time", { ascending: true });

  if (error) throw error;
  return (data || []).map(mapAppointment);
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
  return (data || []).map(mapAppointment);
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
  if (fields.status !== undefined) dbData.status = fields.status;
  if (fields.reminderSent !== undefined) dbData.reminder_sent = fields.reminderSent;
  if (fields.notes !== undefined) dbData.notes = fields.notes;
  if (fields.eventId !== undefined) dbData.event_id = fields.eventId;
  if (fields.dateTime !== undefined) dbData.date_time = fields.dateTime;
  if (fields.duration !== undefined) dbData.duration = fields.duration;
  if (fields.patientName !== undefined) dbData.patient_name = fields.patientName;
  if (fields.patientPhone !== undefined) dbData.patient_phone = fields.patientPhone;
  if (fields.service !== undefined) dbData.service = fields.service;

  const { data, error } = await supabase
    .from("appointments")
    .update(dbData)
    .eq("id", recordId)
    .select()
    .single();

  if (error) throw error;
  return mapAppointment(data);
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
  return (data || []).map(mapAppointment);
}

function mapAppointment(row) {
  if (!row) return null;
  return {
    id: row.id,
    dentistId: row.dentist_id,
    patientName: row.patient_name,
    patientPhone: row.patient_phone,
    service: row.service,
    dateTime: row.date_time,
    duration: row.duration,
    status: row.status,
    reminderSent: row.reminder_sent,
    notes: row.notes,
    eventId: row.event_id,
    createdAt: row.created_at,
  };
}

module.exports = {
  createDentist,
  getDentistById,
  getDentistByEmail,
  getDentistByWhatsAppNumber,
  getClinicsByWhatsAppNumber,
  updateDentist,
  upsertPatient,
  getPatient,
  createAppointment,
  getAppointmentsByDentist,
  getPendingReminders,
  markReminderSent,
  updateAppointment,
  getUpcomingUnconfirmedAppointments,
  createDentistUser,
  getDentistUserByEmail,
  getClinicsByOwnerId,
};
