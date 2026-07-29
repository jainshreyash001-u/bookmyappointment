/**
 * routes/voice.js
 * Voice agent endpoints (Vapi, ElevenLabs)
 */

const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getDentistById } = require("../services/airtable");
const { transcribeAudio } = require("../services/ai-brain");

// POST /api/voice/tts (Text to Speech)
router.post("/tts", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text required" });
  }

  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(400).json({ error: "ElevenLabs not configured" });
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    res.set("Content-Type", "audio/mpeg");
    res.send(response.data);
  } catch (err) {
    console.error("[TTS]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/voice/vapi-webhook/:dentistId (Vapi callback)
router.post("/vapi-webhook/:dentistId", async (req, res) => {
  const { message, metadata, call } = req.body;

  try {
    console.log(`[Vapi] Received: ${message}`);
    
    // Feature: Auto-cut if silence > 25 seconds
    // Note: Vapi.com allows setting 'silenceTimeoutSeconds' in the assistant config.
    // We enforce it here by checking for 'silence' events if supported, 
    // or configuring the outbound call parameters.
    
    if (call && call.silenceDurationSeconds > 25) {
      console.log(`[Vapi] 25s Silence detected. Cutting call.`);
      return res.json({ 
        command: "end-call",
        reason: "silence_timeout" 
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[Vapi Webhook]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/voice/transcribe (Transcribe audio)
router.post("/transcribe", async (req, res) => {
  const { audio } = req.body;

  if (!audio) {
    return res.status(400).json({ error: "Audio required" });
  }

  try {
    const result = await transcribeAudio(audio);

    if (result.success) {
      res.json({ text: result.text });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (err) {
    console.error("[Transcribe]", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
