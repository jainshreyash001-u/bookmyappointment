/**
 * services/pinecone.js
 * ──────────────────────────────────────────────────
 * Pinecone vector database for RAG (knowledge base)
 * Using 1024 dimensions (llama-text-embed-v2)
 */

const { Pinecone } = require("@pinecone-database/pinecone");

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1-aws',
});

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || "bookmyappointment";

// ─── Embed text (1024 dimensions for llama-text-embed-v2) ────────
async function embedText(text) {
  try {
    // Return 1024 dimension vector
    // In production, use actual embedding model
    return Array(1024)
      .fill(0)
      .map(() => Math.random());
  } catch (err) {
    console.error("[Embedding]", err.message);
    return Array(1024)
      .fill(0)
      .map(() => Math.random());
  }
}

// ─── Upsert knowledge for dentist ──────────────────────────────────
async function upsertDentistKnowledge(dentistId, documents) {
  try {
    const index = pinecone.Index(INDEX_NAME);
    const vectors = [];

    for (const doc of documents) {
      const embedding = await embedText(doc.text);
      vectors.push({
        id: `${dentistId}_${doc.id}`,
        values: embedding,
        metadata: {
          dentistId,
          type: doc.type,
          title: doc.title,
          text: doc.text,
        },
      });
    }

    await index.upsert(vectors);
    console.log(`[Pinecone] Upserted ${vectors.length} documents for ${dentistId}`);
    return { success: true, count: vectors.length };
  } catch (err) {
    console.error("[Pinecone Upsert]", err.message);
    return { success: false, error: err.message };
  }
}

// ─── Query knowledge base ──────────────────────────────────────────
async function queryDentistKnowledge(dentistId, query, topK = 5) {
  try {
    const index = pinecone.Index(INDEX_NAME);
    const queryEmbedding = await embedText(query);

    const results = await index.query({
      vector: queryEmbedding,
      topK,
      filter: {
        dentistId: { $eq: dentistId },
      },
      includeMetadata: true,
    });

    const matches = results.matches
      .filter((m) => m.score > 0.7)
      .map((m) => ({
        score: m.score,
        title: m.metadata.title,
        text: m.metadata.text,
        type: m.metadata.type,
      }));

    return matches;
  } catch (err) {
    console.error("[Pinecone Query]", err.message);
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

    await upsertDentistKnowledge(dentistId, defaultDocs);
    console.log(`[Pinecone] Initialized namespace for ${dentistId}`);
    return { success: true };
  } catch (err) {
    console.error("[Initialize Namespace]", err.message);
    return { success: false, error: err.message };
  }
}

// ─── Delete dentist namespace ──────────────────────────────────────
async function deleteDentistNamespace(dentistId) {
  try {
    const index = pinecone.Index(INDEX_NAME);
    await index.deleteMany({
      deleteRequest: {
        filter: {
          dentistId: { $eq: dentistId },
        },
      },
    });
    console.log(`[Pinecone] Deleted namespace for ${dentistId}`);
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
