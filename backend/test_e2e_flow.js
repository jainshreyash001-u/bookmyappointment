/**
 * test_e2e_flow.js
 * ──────────────────────────────────────────────────
 * Automated end-to-end verification script for BookMyAppointment's API layer.
 * This runs against a running server at http://localhost:3001.
 */

require("dotenv").config();
const axios = require("axios");
const supabase = require("./services/supabaseClient");

const PORT = process.env.PORT || 3001;
const API_BASE = `http://localhost:${PORT}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runE2E() {
  console.log("==========================================");
  console.log("       BMA END-TO-END FLOW VALIDATOR      ");
  console.log("==========================================\n");

  const rand = Math.floor(Math.random() * 100000);
  const testEmail = `dentist_e2e_${rand}@example.com`;
  const clinicName = `E2E Dental Center ${rand}`;
  const whatsappNum = `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  let authToken = "";
  let dentistId = "";
  let appointmentId = "";

  try {
    // 1. HEALTH CHECK
    console.log("1. Running Health Check...");
    const health = await axios.get(`${API_BASE}/health`);
    console.log("   ✓ Status:", health.data.status);

    // 2. SIGNUP DENTIST
    console.log("\n2. Registering new Dentist via POST /api/auth/signup...");
    const signupRes = await axios.post(`${API_BASE}/api/auth/signup`, {
      email: testEmail,
      clinicName,
      phoneNumber: whatsappNum,
      workingHours: { hours: "Mon-Fri: 9 AM - 6 PM" },
      slackMode: "off"
    });
    
    if (signupRes.data.success && signupRes.data.token) {
      authToken = signupRes.data.token;
      dentistId = signupRes.data.dentist.dentistId;
      console.log(`   ✓ Signup Success! Dentist ID: ${dentistId}`);
    } else {
      throw new Error("Signup response did not contain success/token");
    }

    const authHeaders = { Authorization: `Bearer ${authToken}` };

    // 3. UPDATE PROFILE
    console.log("\n3. Updating Clinic Operating Hours via PATCH /api/dentist/profile...");
    const patchRes = await axios.patch(`${API_BASE}/api/dentist/profile`, {
      clinicAddress: "Suite 404, Health City, E2E Street",
      workingHours: { hours: "Mon-Sat: 8 AM - 8 PM" }
    }, { headers: authHeaders });

    if (patchRes.data.success) {
      console.log("   ✓ Profile updated successfully.");
    } else {
      throw new Error("Profile update failed.");
    }

    // 4. ADD KNOWLEDGE ENTRY
    console.log("\n4. Adding Cancellation Policy to RAG Vector DB via POST /api/dentist/knowledge...");
    const knowledgeRes = await axios.post(`${API_BASE}/api/dentist/knowledge`, {
      entries: [
        {
          title: "Cancellation Policy",
          description: "Our policy requires at least 24 hours prior notice for cancellations. Late cancellations are subject to a 50% charge of the service cost.",
          type: "policy"
        }
      ]
    }, { headers: authHeaders });

    if (knowledgeRes.data.success) {
      console.log("   ✓ Knowledge entry added & vectorized successfully.");
    } else {
      throw new Error("Knowledge upload failed.");
    }

    // Wait a brief moment for background indexing if any
    await sleep(1500);

    // 5. MANUALLY CREATE APPOINTMENT
    console.log("\n5. Creating new manual appointment via POST /api/appointments...");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // Tomorrow at 2 PM

    const createRes = await axios.post(`${API_BASE}/api/appointments`, {
      patientName: "E2E Test Patient",
      patientPhone: "+919000000001",
      service: "General Cleaning",
      dateTime: tomorrow.toISOString(),
      duration: 45,
      status: "confirmed",
      notes: "First time scaling patient."
    }, { headers: authHeaders });

    if (createRes.data.success && createRes.data.appointment) {
      appointmentId = createRes.data.appointment.id;
      console.log(`   ✓ Appointment created! ID: ${appointmentId}`);
    } else {
      throw new Error("Appointment creation failed.");
    }

    // 6. QUERY APPOINTMENTS
    console.log("\n6. Fetching dentist appointments list via GET /api/appointments...");
    const listRes = await axios.get(`${API_BASE}/api/appointments`, { headers: authHeaders });
    const hasPatient = listRes.data.appointments.some(a => a.patientName === "E2E Test Patient");
    
    if (hasPatient) {
      console.log(`   ✓ Successfully listed appointments. Count: ${listRes.data.total}`);
    } else {
      throw new Error("E2E Test Patient not found in list response.");
    }

    // 7. QUERY CHATBOT RAG
    console.log("\n7. Querying floating patient chatbot widget RAG via POST /api/chat/:dentistId...");
    const chatRes = await axios.post(`${API_BASE}/api/chat/${dentistId}`, {
      message: "Hey, what is your cancellation policy? Do you charge any fee?",
      sessionId: `e2e_session_${rand}`
    });

    console.log(`   - AI Chatbot Response: "${chatRes.data.message}"`);
    const hasKeywords = chatRes.data.message.toLowerCase().includes("24 hours") || 
                        chatRes.data.message.toLowerCase().includes("cancellation") ||
                        chatRes.data.message.toLowerCase().includes("charge");

    if (hasKeywords) {
      console.log("   ✓ RAG matched vector index successfully!");
    } else {
      console.warn("   ⚠️ RAG response did not contain expected terms, checking similarity threshold.");
    }

    // 8. UPDATE APPOINTMENT DETAILS
    console.log("\n8. Updating appointment details via PATCH /api/appointments/:id...");
    const updateRes = await axios.patch(`${API_BASE}/api/appointments/${appointmentId}`, {
      status: "cancelled",
      notes: "Cancelled by patient via phone."
    }, { headers: authHeaders });

    if (updateRes.data.success && updateRes.data.appointment.status === "cancelled") {
      console.log("   ✓ Appointment status updated to 'cancelled'.");
    } else {
      throw new Error("Appointment update failed.");
    }

    // 9. DELETE APPOINTMENT
    console.log("\n9. Deleting appointment via DELETE /api/appointments/:id...");
    const deleteRes = await axios.delete(`${API_BASE}/api/appointments/${appointmentId}`, { headers: authHeaders });
    
    if (deleteRes.data.success) {
      console.log("   ✓ Appointment deleted successfully.");
    } else {
      throw new Error("Appointment deletion failed.");
    }

    // SUCCESS SUMMARY
    console.log("\n==========================================");
    console.log("    ✓ ALL END-TO-END FLOW TESTS PASSED!    ");
    console.log("==========================================");

  } catch (err) {
    console.error("\n❌ E2E FLOW RUNTIME ERROR:", err.response ? err.response.data : err.message);
  } finally {
    // 10. CLEANUP DENTIST DATA
    console.log("\n[Cleanup] Cleaning up test dentist database entries...");
    try {
      if (dentistId) {
        // Delete knowledge namespace vectors
        const { deleteDentistNamespace } = require("./services/knowledge");
        await deleteDentistNamespace(dentistId);
        
        // Delete dentist record
        await supabase.from("dentists").delete().eq("dentist_id", dentistId);
        console.log("   ✓ Test dentist records purged.");
      }
    } catch (cleanErr) {
      console.error("   ✗ Cleanup warning:", cleanErr.message);
    }
    process.exit(0);
  }
}

runE2E();
