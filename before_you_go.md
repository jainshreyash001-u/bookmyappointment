# Before You Go: Google Cloud OAuth & Production Release Guide

This guide walks you through publishing your Google Cloud OAuth app to production so that any dentist can connect their Google Calendar, as well as a checklist of key production settings before you launch.

---

## 1. How to Publish the App in Google Cloud Console

Because the Google Cloud Platform is in "Testing" mode by default, only whitelisted test accounts can sign in. Follow these steps to make it available to all users:

### Step 1: Navigate to the Auth Platform
1. Log in to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project **BookMyAppointment** from the top-left dropdown.
3. Open the navigation menu on the left and select **APIs & Services** -> **OAuth consent screen** (or search for **Google Auth Platform** in the top search bar).

### Step 2: Publish to Production
1. In the left-hand sidebar of the **Google Auth Platform**, click **Audience**.
2. Under the **Publishing status** section, click the **PUBLISH APP** button.
3. A confirmation dialog will appear explaining that you are pushing the app to production. Click **CONFIRM**.

> [!NOTE]
> Once published, any Google account can authorize and connect their Google Calendar without you needing to add them as "Test Users".

### Step 3: Handling the "Unverified App" Warning
Because BookMyAppointment requests access to sensitive Google Calendar scopes (`/auth/calendar` and `/auth/calendar.events`), Google will display a security warning screen saying:
*"Google hasn't verified this app."*

* **For immediate launch:** Dentists can bypass this warning page by clicking **"Advanced"** at the bottom of the Google consent page, and then clicking **"Go to bookmyappointment.online (unsafe)"**.
* **For official verification (optional):** To remove the warning entirely, you can submit the app for verification under the **Verification centre** tab in the Google Auth Platform. This requires a privacy policy URL and a YouTube demo showing how your app syncs the calendar events.

---

## 2. Production Checklist (Environment Variables)

Ensure that your live production backend has the following settings in its hosting dashboard environment variables:

| Variable | Target Value / Source | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations. |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://owdryehvwndhdzggnfsd.supabase.co` | Supabase database endpoint. |
| `SUPABASE_SERVICEROLE_KEY` | *(Your Secret Service Role Key)* | Bypasses Row-Level Security for authenticated backend writes. |
| `GOOGLE_CLIENT_ID` | `501896837584-...` | Google App Client ID. |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Google App Secret. |
| `GOOGLE_REDIRECT_URI` | `https://api.bookmyappointment.online/api/auth/google/callback` | OAuth redirect callback. |
| `RAZORPAY_KEY_ID` | *(Your Live Razorpay ID)* | Real-time payment processing (change test keys to live keys). |
| `RAZORPAY_KEY_SECRET` | *(Your Live Razorpay Secret)* | Verification signature matching. |
| `GROQ_API_KEY` | *(Your Groq Key)* | Powers the LLM-RAG patient messaging brain. |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Latest active LLM model. |

---

## 3. Database Purge Utility (For Resetting)
If you ever need to purge your backend database again to clear test data:
```bash
node -e "require('dotenv').config(); const supabase = require('./services/supabaseClient'); async function clean() { await supabase.from('dentist_knowledge').delete().neq('id', '00000000-0000-0000-0000-000000000000'); await supabase.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000'); await supabase.from('patients').delete().neq('id', '00000000-0000-0000-0000-000000000000'); await supabase.from('dentists').delete().neq('id', '00000000-0000-0000-0000-000000000000'); console.log('DB Cleaned!'); } clean();"
```
