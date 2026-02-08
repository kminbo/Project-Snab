import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// Default voice - "Rachel" is a warm, conversational voice
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

let client = null;
let currentAudio = null;

function getClient() {
  if (!client) {
    if (!API_KEY) {
      throw new Error("VITE_ELEVENLABS_API_KEY is not set in environment variables");
    }
    client = new ElevenLabsClient({ apiKey: API_KEY });
  }
  return client;
}

// Handles text-to-speech conversion using ElevenLabs API
export async function speakText(text, voiceId = DEFAULT_VOICE_ID) {
  // Stop any currently playing audio before starting new speech
  stopAudio();

  try {
    const elevenlabs = getClient();

    // Request speech synthesis from ElevenLabs
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
    });

    // Collect the audio stream chunks into a single Blob
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBlob = new Blob(chunks, { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Create an HTML5 Audio object and play it
    currentAudio = new Audio(audioUrl);
    currentAudio.onended = () => {
      URL.revokeObjectURL(audioUrl); // Clean up memory after playback
      currentAudio = null;
    };

    await currentAudio.play();
    return currentAudio;
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    throw error;
  }
}

// Stops the current voice playback immediately
export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export function isPlaying() {
  return currentAudio !== null && !currentAudio.paused;
}
