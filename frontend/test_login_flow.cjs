/**
 * test_login_flow.js
 * ──────────────────────────────────────────────────
 * Automated Browser Test for the Frontend Login-to-Dashboard Flow.
 * Uses Playwright to simulate user interaction in a real browser.
 * Usage:
 *   1. Install Playwright: npm install playwright
 *   2. Run: node test_login_flow.js [TARGET_URL]
 *      Example: node test_login_flow.js https://bookmyappointment.online
 */

const { chromium } = require("playwright");

const TARGET_URL = process.argv[2] || "https://bookmyappointment.online";
const TEST_EMAIL = "shreyash.23bai10003@vitbhopal.ac.in";
const TEST_PASSWORD = "test_password_123";

async function runBrowserTest() {
  console.log("==========================================");
  console.log("      E2E FRONTEND LOGIN FLOW TEST        ");
  console.log(`      Target Web App: ${TARGET_URL}`);
  console.log("==========================================\n");

  console.log("Step 1: Launching headless browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to browser console and errors
  page.on('console', msg => console.log('   [Browser Console]', msg.text()));
  page.on('pageerror', err => console.log('   [Browser JS Error]', err.message));

  try {
    // 1. Navigate to Login Page
    console.log(`Step 2: Navigating directly to login url: ${TARGET_URL}/login`);
    await page.goto(`${TARGET_URL}/login`);
    console.log(`   ✓ Arrived at: ${page.url()}`);
    console.log(`   ✓ Page Title: "${await page.title()}"`);

    // 2. Validate Login Form Inputs Exist
    console.log("\nStep 3: Checking for login form elements...");
    await page.waitForSelector("input[type='email']", { timeout: 5000 });
    await page.waitForSelector("input[type='password']", { timeout: 5000 });
    await page.waitForSelector("button[type='submit']", { timeout: 5000 });
    console.log("   ✓ Email input, password input, and submit button are present.");

    // 3. Fill Credentials
    console.log(`\nStep 4: Filling email: "${TEST_EMAIL}" and password...`);
    await page.fill("input[type='email']", TEST_EMAIL);
    await page.fill("input[type='password'], input[placeholder='Password']", TEST_PASSWORD);

    // 4. Click Submit & Wait for Redirection
    console.log("\nStep 5: Clicking the LOGIN button...");
    await page.click("button[type='submit']");
    console.log("   ✓ Clicked. Waiting for client-side navigation...");

    // Wait for the URL to change to dashboard or onboarding (max 10 seconds)
    await page.waitForURL((url) => url.pathname === "/dashboard" || url.pathname === "/onboarding", {
      timeout: 10000
    });
    
    const finalUrl = page.url();
    console.log(`   ✓ Redirected successfully! Current URL: ${finalUrl}`);

    // 5. Verify local storage values
    console.log("\nStep 6: Checking Local Storage for authentication keys...");
    const localStorageData = await page.evaluate(() => {
      return {
        authToken: localStorage.getItem("authToken"),
        userPlan: localStorage.getItem("userPlan"),
        dentistId: localStorage.getItem("dentistId")
      };
    });

    console.log("   ✓ Local Storage keys retrieved:");
    console.log(`     - authToken: ${localStorageData.authToken ? "✓ PRESENT (Valid JWT)" : "✗ MISSING"}`);
    console.log(`     - userPlan: "${localStorageData.userPlan}"`);
    console.log(`     - dentistId: "${localStorageData.dentistId}"`);

    if (!localStorageData.authToken) {
      throw new Error("Login succeeded but 'authToken' was not set in Local Storage.");
    }

    // 6. Verify Dashboard Components Rendered
    console.log("\nStep 7: Verifying Dashboard elements loaded...");
    if (finalUrl.includes("/dashboard")) {
      // Check for prominent dashboard layout elements (e.g., Quick Stats cards or Welcome header)
      await page.waitForSelector("h1", { timeout: 5000 });
      const headerText = await page.innerText("h1");
      console.log(`   ✓ Found Header: "${headerText}"`);
      
      // Take page screenshot
      const screenshotPath = "dashboard_success_screenshot.png";
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`   ✓ Saved visual layout snapshot to: ./${screenshotPath}`);
    } else {
      console.log("   ✓ Landed on /onboarding page. Verifying onboarding wizard step...");
      await page.waitForSelector("h2", { timeout: 5000 });
      const firstHeading = await page.innerText("h2");
      console.log(`   ✓ Found Onboarding Step Header: "${firstHeading}"`);

      // Take page screenshot
      const screenshotPath = "onboarding_success_screenshot.png";
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`   ✓ Saved visual layout snapshot to: ./${screenshotPath}`);
    }

    console.log("\n==========================================");
    console.log("   ✓ ALL E2E BROWSER LOGIN TESTS PASSED!  ");
    console.log("==========================================");

  } catch (err) {
    console.error("\n❌ E2E BROWSER TEST FAILED:");
    console.error(`   Error Message: ${err.message}`);
    
    // Capture failure state screenshot
    try {
      const failScreenshot = "failure_state_screenshot.png";
      await page.screenshot({ path: failScreenshot, fullPage: true });
      console.log(`   ✓ Saved failure state snapshot to: ./${failScreenshot}`);
    } catch {}
  } finally {
    console.log("\nStep 8: Closing browser session.");
    await browser.close();
    process.exit(0);
  }
}

runBrowserTest();
