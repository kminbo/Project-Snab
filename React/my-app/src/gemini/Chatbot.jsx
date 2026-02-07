import { useState, useRef, useEffect } from "react";
import { sendMessage, resetChat } from "./geminiChat.js";
import { speakText, stopAudio } from "./elevenLabsVoice.js";

// Session info - will be dynamic later
const SESSION_INFO = {
  currentGame: "Anxiety Navigator", // null when no game active
};

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey What's up?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    // Build message with session context for Gemini
    const sessionContext = SESSION_INFO.currentGame
      ? `[Currently playing: ${SESSION_INFO.currentGame}]`
      : `[No game active]`;
    const messageWithContext = `${sessionContext} ${userMessage}`;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]); // UI shows clean message
    setIsLoading(true);

    try {
      const response = await sendMessage(messageWithContext); // API gets context
      setMessages((prev) => [...prev, { role: "assistant", text: response }]);
      if (voiceEnabled) {
        speakText(response).catch(console.error);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "error", text: `Error: ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    resetChat();
    setMessages([]);
    stopAudio();
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopAudio();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Gemini Chatbot</h2>
        <button onClick={handleReset} style={styles.resetButton}>
          Reset
        </button>
      </div>

      <div style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              ...(msg.role === "user" ? styles.userMessage : styles.assistantMessage),
              ...(msg.role === "error" ? styles.errorMessage : {}),
            }}
          >
            {msg.text}
          </div>
        ))}
        {isLoading && <div style={styles.loading}>Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <button
          type="button"
          onClick={toggleVoice}
          style={{
            ...styles.voiceButton,
            ...(voiceEnabled ? styles.voiceButtonActive : {}),
          }}
          title={voiceEnabled ? "Voice On" : "Voice Off"}
        >
          {voiceEnabled ? "🔊" : "🔇"}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={styles.input}
          disabled={isLoading}
        />
        <button type="submit" style={styles.sendButton} disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "500px",
    maxWidth: "600px",
    margin: "0 auto",
    border: "1px solid #ccc",
    borderRadius: "8px",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#4285f4",
    color: "white",
  },
  title: {
    margin: 0,
    fontSize: "18px",
  },
  voiceButton: {
    padding: "10px 12px",
    backgroundColor: "#f5f5f5",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    marginRight: "8px",
  },
  voiceButtonActive: {
    backgroundColor: "#4285f4",
    borderColor: "#4285f4",
  },
  resetButton: {
    padding: "6px 12px",
    backgroundColor: "white",
    color: "#4285f4",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    backgroundColor: "#f5f5f5",
  },
  message: {
    padding: "10px 14px",
    marginBottom: "8px",
    borderRadius: "8px",
    maxWidth: "80%",
    wordWrap: "break-word",
  },
  userMessage: {
    backgroundColor: "#4285f4",
    color: "white",
    marginLeft: "auto",
  },
  assistantMessage: {
    backgroundColor: "white",
    color: "#333",
    border: "1px solid #ddd",
    marginRight: "auto",
  },
  errorMessage: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    border: "1px solid #ef9a9a",
  },
  loading: {
    color: "#666",
    fontStyle: "italic",
    padding: "10px",
  },
  form: {
    display: "flex",
    padding: "12px",
    backgroundColor: "white",
    borderTop: "1px solid #ccc",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginRight: "8px",
    fontSize: "14px",
  },
  sendButton: {
    padding: "10px 20px",
    backgroundColor: "#4285f4",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
