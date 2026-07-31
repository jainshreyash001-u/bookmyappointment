/**
 * services/knowledge.js
 * ──────────────────────────────────────────────────
 * Clinic knowledge-base vector search & processing.
 * Generates embeddings locally using @xenova/transformers (all-MiniLM-L6-v2) - 384 dimensions.
 */

const { pipeline } = require("@xenova/transformers");
const supabase = require("./supabaseClient");

let extractor = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractor;
}

// ─── Embed text (384 dimensions for all-MiniLM-L6-v2) ────────
async function embedText(text) {
  try {
    const embedder = await getExtractor();
    const output = await embedder(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  } catch (err) {
    console.error("[Embedding Error]", err.message);
    return Array(384).fill(0).map(() => Math.random());
  }
}

// ─── Upsert knowledge for dentist ──────────────────────────────────
async function upsertDentistKnowledge(dentistId, documents) {
  try {
    const rows = [];
    for (const doc of documents) {
      const embedding = await embedText(doc.text);
      rows.push({
        dentist_id: dentistId,
        type: doc.type || "general",
        title: doc.title || "",
        content: doc.text,
        embedding: embedding,
      });
    }

    const { error } = await supabase
      .from("dentist_knowledge")
      .insert(rows);

    if (error) throw error;

    console.log(`[Supabase RAG] Upserted ${rows.length} documents for ${dentistId}`);
    return { success: true, count: rows.length };
  } catch (err) {
    console.error("[Supabase RAG Upsert]", err.message);
    return { success: false, error: err.message };
  }
}

// ─── Query knowledge base ──────────────────────────────────────────
async function queryDentistKnowledge(dentistId, query, topK = 5) {
  try {
    const queryEmbedding = await embedText(query);

    const { data, error } = await supabase.rpc("match_knowledge", {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: topK,
      filter_dentist_id: dentistId,
    });

    if (error) throw error;

    const matches = (data || []).map((m) => ({
      score: m.similarity,
      title: m.title,
      text: m.content,
      type: m.type,
    }));

    return matches;
  } catch (err) {
    console.error("[Supabase RAG Query]", err.message);
    return [];
  }
}

// ─── Store learned answer ──────────────────────────────────────────
async function storeLearnedAnswer(dentistId, question, answer, type = "faq") {
  try {
    await upsertDentistKnowledge(dentistId, [
      {
        id: `learned_${Date.now()}`,
        type,
        title: question,
        text: answer,
      },
    ]);
    return { success: true };
  } catch (err) {
    console.error("[Store Learned]", err.message);
    return { success: false, error: err.message };
  }
}

// ─── Initialize dentist namespace ─────────────────────────────────
async function initializeDentistNamespace(dentistId) {
  try {
    const defaultDocs = [
      {
        id: "clinic_info",
        type: "policy",
        title: "Clinic Information",
        text: `This is a dental clinic. We provide dental services and accept online appointments.`,
      },
      {
        id: "booking_policy",
        type: "policy",
        title: "Booking Policy",
        text: `Patients can book appointments online via WhatsApp or website. Please book in advance for better service.`,
      },
      {
        id: "cancellation_policy",
        type: "policy",
        title: "Cancellation Policy",
        text: `Appointments can be cancelled 24 hours in advance. Late cancellations may result in charges.`,
      },
    ];

    const result = await upsertDentistKnowledge(dentistId, defaultDocs);
    if (!result.success) throw new Error(result.error);
    console.log(`[Supabase RAG] Initialized namespace for ${dentistId}`);
    return { success: true };
  } catch (err) {
    console.error("[Initialize Namespace]", err.message);
    return { success: false, error: err.message };
  }
}

// ─── Delete dentist namespace ──────────────────────────────────────
async function deleteDentistNamespace(dentistId) {
  try {
    const { error } = await supabase
      .from("dentist_knowledge")
      .delete()
      .eq("dentist_id", dentistId);

    if (error) throw error;

    console.log(`[Supabase RAG] Deleted namespace for ${dentistId}`);
    return { success: true };
  } catch (err) {
    console.error("[Delete Namespace]", err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  embedText,
  upsertDentistKnowledge,
  queryDentistKnowledge,
  storeLearnedAnswer,
  initializeDentistNamespace,
  deleteDentistNamespace,
};
