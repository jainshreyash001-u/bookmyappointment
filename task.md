# Task List: BookMyAppointment Platform Completion

- [x] **1. Implement Missing Backend Services**
  - [x] Create `backend/services/schedule-notification.js` to process automated WhatsApp reminders.
  - [x] Verify the daily notification cron-job runs successfully using the new service.
- [x] **2. Implement Frontend Components**
  - [x] Implement `frontend/src/components/ChatWidget.jsx` (floating RAG-powered chatbot widget for patient pages).
  - [x] Implement `frontend/src/components/AppointmentForm.jsx` (form for scheduling and editing appointments).
  - [x] Implement `frontend/src/components/PaymentModal.jsx` (Razorpay payment handler modal).
  - [x] Implement `frontend/src/components/Navbar.jsx` (clean premium navigation bar component).
  - [x] Implement `frontend/src/components/Sidebar.jsx` (clean dashboard navigation sidebar).
- [x] **3. End-to-End Flow Verification**
  - [x] Verify dentist onboarding/profile save flow works with Supabase.
  - [x] Test client chatbot interaction and database logging.

- [x] **4. Password Hashing and Security Layer**
  - [x] Implement database column mapping (`clinic_address` -> `PasswordHash`) in `backend/services/database.js`
  - [x] Update signup route in `backend/routes/auth.js` to hash password using `bcryptjs`
  - [x] Update login route in `backend/routes/auth.js` to compare password hash using `bcryptjs`
  - [x] Update test script `backend/test_auth_system.js` to send passwords and verify authentication rejections
  - [x] Run backend tests locally to verify password security is 100% operational

- [ ] **5. SendGrid Email OTP Password Reset**
  - [ ] Create `backend/services/email.js` to send OTP emails via SendGrid Web API
  - [ ] Implement `POST /api/auth/forgot-password` route in `backend/routes/auth.js`
  - [ ] Implement `POST /api/auth/verify-otp` route in `backend/routes/auth.js`
  - [ ] Update frontend `frontend/src/pages/LoginPage.jsx` to show reset modal and trigger OTP flows
  - [ ] Update E2E test scripts to verify OTP functionality
