const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

let mediaRecorder = null;
let audioChunks = [];

export function startRecording() {
  return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start();
  });
}

export function stopRecording() {
  return new Promise((resolve) => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      resolve(null);
      return;
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
      // Stop all mic tracks so the browser releases the microphone
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      mediaRecorder = null;
      audioChunks = [];
      resolve(audioBlob);
    };

    mediaRecorder.stop();
  });
}

export async function transcribeAudio(audioBlob) {
  if (!API_KEY) {
    throw new Error("VITE_ELEVENLABS_API_KEY is not set in environment variables");
  }

  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("model_id", "scribe_v1");

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs STT error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.text || "";
}
