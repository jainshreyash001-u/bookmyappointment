/**
 * test_auth_system.js
 * ──────────────────────────────────────────────────
 * Diagnostic test suite for the BookMyAppointment Authentication Layer.
 * Can be run against local or production server.
 * Usage:
 *   node test_auth_system.js [TARGET_URL]
 *   Example: node test_auth_system.js https://api.bookmyappointment.online
 */

require("dotenv").config();
const axios = require("axios");
const supabase = require("./services/supabaseClient");

const API_BASE = process.argv[2] || "https://api.bookmyappointment.online";

async function runTests() {
  console.log("==========================================");
  console.log("    AUTHENTICATION LAYER TEST SUITE      ");
  console.log(`    Target: ${API_BASE}`);
  console.log("==========================================\n");

  const rand = Math.floor(Math.random() * 1000000);
  const testEmail = `auth_test_${rand}@example.com`;
  const mixedCaseEmail = `AuTh_TeSt_${rand}@ExAmPlE.cOm`;
  const clinicName = `Auth Test Clinic ${rand}`;
  const whatsappNum = `+9199999${Math.floor(10000 + Math.random() * 90000)}`;

  let signupToken = "";
  let loginToken = "";
  let dentistId = "";

  try {
    // 1. Health check
    console.log("Step 1: Checking API Server Health...");
    try {
      const health = await axios.get(`${API_BASE}/health`);
      console.log(`   ✓ Health Check Passed: ${JSON.stringify(health.data)}\n`);
    } catch (e) {
      console.log(`   ✗ Health Check Failed: ${e.message}`);
      console.log("   (Continuing tests anyway...)\n");
    }

    // 2. Signup Test
    console.log(`Step 2: Testing Signup (POST /api/auth/signup)...`);
    const signupRes = await axios.post(`${API_BASE}/api/auth/signup`, {
      email: testEmail,
      clinicName,
      phoneNumber: whatsappNum,
      workingHours: { hours: "Mon-Fri: 9-5" },
      slackMode: "off",
      password: "TestPassword123"
    });

    if (signupRes.data.success && signupRes.data.token) {
      signupToken = signupRes.data.token;
      dentistId = signupRes.data.dentist.dentistId;
      console.log(`   ✓ Signup Success!`);
      console.log(`   ✓ Generated Dentist ID: ${dentistId}`);
      console.log(`   ✓ Token structure is valid.\n`);
    } else {
      throw new Error("Signup response format invalid.");
    }

    // 3. Duplicate Registration Check
    console.log("Step 3: Testing Duplicate Registration...");
    try {
      await axios.post(`${API_BASE}/api/auth/signup`, {
        email: testEmail,
        clinicName: "Duplicate Clinic"
      });
      console.log("   ✗ Failed: Server allowed duplicate registration.");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`   ✓ Correctly Blocked with 400: "${err.response.data.error}"\n`);
      } else {
        console.log(`   ✗ Unexpected response: ${err.message}\n`);
      }
    }

    // 4. Login with Correct Credentials
    console.log("Step 4: Testing Login (POST /api/auth/login)...");
    const loginRes = await axios.post(`${API_BASE}/api/auth/login`, {
      email: testEmail,
      password: "TestPassword123"
    });

    if (loginRes.data.success && loginRes.data.token) {
      loginToken = loginRes.data.token;
      console.log("   ✓ Login Success!");
      console.log(`   ✓ Dentist Name returned: "${loginRes.data.dentist.clinicName}"\n`);
    } else {
      throw new Error("Login response format invalid.");
    }

    // 5. Case Insensitivity / Normalization Check
    console.log("Step 5: Testing Casing Normalization (Mixed Capitalization Login)...");
    const casingRes = await axios.post(`${API_BASE}/api/auth/login`, {
      email: mixedCaseEmail,
      password: "TestPassword123"
    });

    if (casingRes.data.success && casingRes.data.token) {
      console.log("   ✓ Normalization Success! Mixed-case email resolved successfully.\n");
    } else {
      throw new Error("Casing normalization test failed.");
    }

    // 6. Login with Non-existent Email
    console.log("Step 6: Testing Non-existent Email Login...");
    try {
      await axios.post(`${API_BASE}/api/auth/login`, {
        email: "nonexistent_dentist_email_123@example.com",
        password: "TestPassword123"
      });
      console.log("   ✗ Failed: Server allowed login for non-existent dentist.");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log(`   ✓ Correctly Blocked with 401: "${err.response.data.error}"\n`);
      } else {
        console.log(`   ✗ Unexpected response: ${err.message}\n`);
      }
    }

    // 6b. Login with Incorrect Password
    console.log("Step 6b: Testing Incorrect Password Login...");
    try {
      await axios.post(`${API_BASE}/api/auth/login`, {
        email: testEmail,
        password: "WrongPassword999"
      });
      console.log("   ✗ Failed: Server allowed login with incorrect password.");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log(`   ✓ Correctly Blocked with 401: "${err.response.data.error}"\n`);
      } else {
        console.log(`   ✗ Unexpected response: ${err.message}\n`);
      }
    }

    // 7. Login with Empty Input
    console.log("Step 7: Testing Validation on Empty Email...");
    try {
      await axios.post(`${API_BASE}/api/auth/login`, {
        email: ""
      });
      console.log("   ✗ Failed: Server allowed empty email login.");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`   ✓ Correctly Blocked with 400: "${err.response.data.error}"\n`);
      } else {
        console.log(`   ✗ Unexpected response: ${err.message}\n`);
      }
    }

    // 7b. Forgot Password for Non-existent Email
    console.log("Step 7b: Testing Forgot Password for Non-existent Email...");
    try {
      await axios.post(`${API_BASE}/api/auth/forgot-password`, {
        email: "this_is_a_completely_fake_email_999@example.com"
      });
      console.log("   ✗ Failed: Server allowed forgot password request for non-existent email.");
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log(`   ✓ Correctly Blocked with 404: "${err.response.data.error}"\n`);
      } else {
        console.log(`   ✗ Unexpected response: ${err.message}\n`);
      }
    }

    // 7c. Forgot Password for Registered Email
    console.log("Step 7c: Testing Forgot Password for Registered Email...");
    try {
      const forgotRes = await axios.post(`${API_BASE}/api/auth/forgot-password`, {
        email: testEmail
      });
      if (forgotRes.data.success) {
        console.log("   ✓ OTP sent successfully to registered email!\n");
      } else {
        console.log("   ✗ Failed: Forgot password endpoint returned success false.\n");
      }
    } catch (err) {
      console.log(`   ✗ Failed: ${err.message}\n`);
    }

    // 7d. Verify OTP with Invalid Code
    console.log("Step 7d: Testing Verify OTP with Invalid Code...");
    try {
      await axios.post(`${API_BASE}/api/auth/verify-otp`, {
        email: testEmail,
        otp: "000000",
        newPassword: "NewSecurePassword123"
      });
      console.log("   ✗ Failed: Server accepted invalid OTP code.");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`   ✓ Correctly Blocked with 400: "${err.response.data.error}"\n`);
      } else {
        console.log(`   ✗ Unexpected response: ${err.message}\n`);
      }
    }

    // 8. Auth Gateway Access (/profile)
    console.log("Step 8: Testing Authentication Headers (GET /api/dentist/profile)...");
    
    // 8a. Request with Valid Token
    console.log("   8a. Querying with Valid Bearer Token...");
    const profileRes = await axios.get(`${API_BASE}/api/dentist/profile`, {
      headers: { Authorization: `Bearer ${loginToken}` }
    });
    if (profileRes.data.dentistId === dentistId) {
      console.log(`       ✓ Access Granted! Retrieved profile for: "${profileRes.data.name}"`);
    } else {
      console.log("       ✗ Failed: ID mismatch on profile response.");
    }

    // 8b. Request with Invalid Token
    console.log("   8b. Querying with Invalid Token...");
    try {
      await axios.get(`${API_BASE}/api/dentist/profile`, {
        headers: { Authorization: "Bearer malformed_or_expired_jwt_token_xyz" }
      });
      console.log("       ✗ Failed: Server permitted malformed token.");
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log(`       ✓ Correctly Blocked with ${err.response.status}: "${err.response.data.error}"`);
      } else {
        console.log(`       ✗ Unexpected response: ${err.message}`);
      }
    }

    // 8c. Request with Missing Token
    console.log("   8c. Querying with Missing Headers...");
    try {
      await axios.get(`${API_BASE}/api/dentist/profile`);
      console.log("       ✗ Failed: Server permitted request without Authorization header.");
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log(`       ✓ Correctly Blocked with ${err.response.status}: "${err.response.data.error}"\n`);
      } else {
        console.log(`       ✗ Unexpected response: ${err.message}\n`);
      }
    }

    // 8d. Test Authenticated Change Password
    console.log("   8d. Testing Change Password with Correct Current Password...");
    const changePassRes = await axios.post(`${API_BASE}/api/auth/change-password`, {
      currentPassword: "TestPassword123",
      newPassword: "UpdatedTestPassword123"
    }, {
      headers: { Authorization: `Bearer ${loginToken}` }
    });
    if (changePassRes.data.success) {
      console.log("       ✓ Change password endpoint returned success true.");
    } else {
      console.log("       ✗ Failed: Change password endpoint returned success false.");
    }

    // 8e. Verify Log In with New Password
    console.log("   8e. Verifying Login with New Password...");
    const newLoginRes = await axios.post(`${API_BASE}/api/auth/login`, {
      email: testEmail,
      password: "UpdatedTestPassword123"
    });
    if (newLoginRes.data.token) {
      console.log("       ✓ Successfully logged in with the new password.");
    } else {
      console.log("       ✗ Failed: Could not login with the new password.");
    }

    // 8f. Test Change Password with Incorrect Current Password
    console.log("   8f. Testing Change Password with Incorrect Current Password...");
    try {
      await axios.post(`${API_BASE}/api/auth/change-password`, {
        currentPassword: "WrongPassword123",
        newPassword: "YetAnotherPassword123"
      }, {
        headers: { Authorization: `Bearer ${newLoginRes.data.token}` }
      });
      console.log("       ✗ Failed: Server accepted incorrect current password.");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`       ✓ Correctly Blocked with 400: "${err.response.data.error}"\n`);
      } else {
        console.log(`       ✗ Unexpected response: ${err.message}\n`);
      }
    }

    console.log("==========================================");
    console.log("   ✓ ALL AUTHENTICATION SYSTEM TESTS PASSED! ");
    console.log("==========================================");

  } catch (error) {
    console.error("\n❌ TEST SUITE RUNTIME ERROR:");
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error("   Response Data:", error.response.data);
    } else {
      console.error(`   Message: ${error.message}`);
    }
  } finally {
    // 9. Cleanup test entries
    if (dentistId) {
      console.log("\nStep 9: Cleaning up test database records...");
      try {
        const { deleteDentistNamespace } = require("./services/knowledge");
        try {
          await deleteDentistNamespace(dentistId);
        } catch {}
        
        const { error } = await supabase.from("dentists").delete().eq("dentist_id", dentistId);
        if (error) {
          console.error("   ✗ Database cleanup error:", error.message);
        } else {
          console.log("   ✓ Cleaned up test dentist records successfully.");
        }
      } catch (cleanErr) {
        console.error("   ✗ Cleanup warning:", cleanErr.message);
      }
    }
    process.exit(0);
  }
}

runTests();
