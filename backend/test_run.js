/**
 * test_run.js
 * ──────────────────────────────────────────────────
 * Automated test script to verify the backend migration components:
 * 1. Environment Variable Check
 * 2. Supabase Connection & Credentials Check
 * 3. Xenova Local Embedding Generation (all-MiniLM-L6-v2)
 * 4. Database CRUD Operation (Dentists)
 * 5. Knowledge RAG Vector Query Operation
 */

require("dotenv").config();
const { embedText, initializeDentistNamespace, queryDentistKnowledge } = require("./services/knowledge");
const { createDentist, getDentistById } = require("./services/database");
const supabase = require("./services/supabaseClient");

async function runTests() {
  console.log("==========================================");
  console.log("      BOOKMYAPPOINTMENT MIGRATION TEST     ");
  console.log("==========================================\n");

  let envPassed = true;
  let embeddingPassed = false;
  let supabaseConnPassed = false;
  let dbQueriesPassed = false;
  let vectorSearchPassed = false;

  const missingVars = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.SUPABASE_SERVICEROLE_KEY) missingVars.push("SUPABASE_SERVICEROLE_KEY");
  if (!process.env.JWT_SECRET) missingVars.push("JWT_SECRET");

  if (missingVars.length > 0) {
    console.error(`❌ [TEST 1] Environment Check Failed! Missing variables: ${missingVars.join(", ")}`);
    envPassed = false;
  } else {
    console.log("✅ [TEST 1] Environment Variables: Configured correctly.");
  }

  if (!envPassed) {
    console.log("\nStopping tests because environment variables are not configured.");
    return;
  }

  // TEST 2: Local Embedding Model
  console.log("\n[TEST 2] Testing Xenova Local Embedding generation...");
  try {
    const startTime = Date.now();
    const testText = "Root canal treatment and dental crown services.";
    const vector = await embedText(testText);
    const duration = Date.now() - startTime;
    
    if (Array.isArray(vector) && vector.length === 384) {
      console.log(`✅ [TEST 2] Local Embeddings: Success! Generated 384-dimensional vector in ${duration}ms.`);
      embeddingPassed = true;
    } else {
      console.error(`❌ [TEST 2] Local Embeddings: Failed. Returned vector format incorrect:`, typeof vector);
    }
  } catch (err) {
    console.error(`❌ [TEST 2] Local Embeddings: Error during feature extraction:`, err.message);
  }

  // TEST 3: Supabase Connection
  console.log("\n[TEST 3] Testing connection to Supabase...");
  try {
    const { data, error } = await supabase.from("dentists").select("count").limit(1);
    if (error) {
      if (error.code === "PGRST116" || error.code === "42P01") {
        console.log(`⚠️ [TEST 3] Connection: Established, but tables don't exist yet in Supabase.`);
        console.log(`👉 Please ensure you run 'supabase_schema.sql' in your Supabase SQL Editor.`);
        supabaseConnPassed = true; // Connection was made successfully, schema is just empty
      } else {
        throw error;
      }
    } else {
      console.log(`✅ [TEST 3] Connection: Successfully connected and query executed.`);
      supabaseConnPassed = true;
    }
  } catch (err) {
    console.error(`❌ [TEST 3] Connection: Failed to connect to Supabase:`, err.message);
  }

  // TEST 4 & 5 will only run if Supabase is connected and tables exist
  if (supabaseConnPassed) {
    const dummyDentistId = `TEST_DT_${Math.floor(Math.random() * 10000)}`;

    console.log("\n[TEST 4] Testing Database operations (Dentists table)...");
    try {
      // 1. Create Dentist
      const dummyDentist = {
        DentistID: dummyDentistId,
        Name: "Dr. Verification Test",
        Email: `test_${dummyDentistId.toLowerCase()}@example.com`,
        WhatsAppNumber: "+910000000000",
        ClinicName: "Verification Labs Clinic",
        PasswordHash: "dummy_password_hash_123",
      };

      const created = await createDentist(dummyDentist);
      console.log(`   - Created dummy dentist record in DB: ${created.id}`);

      // 2. Fetch Dentist
      const fetched = await getDentistById(dummyDentistId);
      if (fetched && fetched.fields.Name === dummyDentist.Name) {
        console.log("✅ [TEST 4] Database CRUD operations: Success!");
        dbQueriesPassed = true;
      } else {
        console.error("❌ [TEST 4] Database CRUD: Fetched record name mismatch or record not found.");
      }
    } catch (err) {
      if (err.message.includes("does not exist") || err.code === "42P01") {
        console.error(`❌ [TEST 4] Database CRUD: Failed. Dentist table does not exist in Supabase yet.`);
        console.error(`👉 Please paste and run 'supabase_schema.sql' inside your Supabase dashboard.`);
      } else {
        console.error(`❌ [TEST 4] Database CRUD: Error during SQL operations:`, err.message);
      }
    }

    console.log("\n[TEST 5] Testing Vector Search (Dentist Knowledge Table & RAG)...");
    try {
      // 1. Initialize namespace
      console.log(`   - Initializing namespace for ${dummyDentistId}...`);
      const initResult = await initializeDentistNamespace(dummyDentistId);
      
      if (initResult.success) {
        console.log("   - Namespace initialized. Querying RAG index for matching documents...");
        // 2. Query
        const matches = await queryDentistKnowledge(dummyDentistId, "cancellation policy", 1);
        if (matches.length > 0) {
          console.log(`   - Match found: "${matches[0].title}" (score: ${matches[0].score.toFixed(3)})`);
          console.log("✅ [TEST 5] Vector Search & RAG: Success!");
          vectorSearchPassed = true;
        } else {
          console.error("❌ [TEST 5] Vector Search: Query completed but returned no documents.");
        }
      } else {
        console.error("❌ [TEST 5] Vector Search: Failed to initialize dentist namespace:", initResult.error);
      }
    } catch (err) {
      if (err.message.includes("does not exist") || err.code === "42P01") {
        console.error(`❌ [TEST 5] Vector Search: Failed. Knowledge table or RPC function 'match_knowledge' does not exist in Supabase.`);
      } else {
        console.error(`❌ [TEST 5] Vector Search: Error during vector matching:`, err.message);
      }
    }

    // Clean up test data if tables exist
    try {
      console.log("\n[Cleanup] Cleaning up test data...");
      const { deleteDentistNamespace } = require("./services/knowledge");
      await deleteDentistNamespace(dummyDentistId);
      
      const { data: deleted, error } = await supabase
        .from("dentists")
        .delete()
        .eq("dentist_id", dummyDentistId);
        
      console.log("   - Cleanup completed.");
    } catch (err) {
      console.log("   - Warning during cleanup:", err.message);
    }
  }

  console.log("\n==========================================");
  console.log("             TEST SUMMARY REPORT          ");
  console.log("==========================================");
  console.log(`1. Environment Config:      ${envPassed ? "PASS" : "FAIL"}`);
  console.log(`2. Local Transformers RAG:   ${embeddingPassed ? "PASS" : "FAIL"}`);
  console.log(`3. Supabase Client Ping:    ${supabaseConnPassed ? "PASS" : "FAIL"}`);
  console.log(`4. Database CRUD:            ${dbQueriesPassed ? "PASS" : "FAIL"}`);
  console.log(`5. Vector pgvector Matching: ${vectorSearchPassed ? "PASS" : "FAIL"}`);
  console.log("==========================================\n");
}

runTests();
