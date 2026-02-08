import React, { useState, useEffect, useRef } from 'react';
import { initializeGemini, sendMessage, sendMessageStream, resetChat, analyzeConfirmation, analyzeTheme } from '../gemini/geminiChat';
import { speakText, stopAudio } from '../gemini/elevenLabsVoice';

const ChatArea = (props) => {
    const { sidebarMode, onReset } = props;
    const [messages, setMessages] = useState([
        { id: 1, sender: 'agent', text: 'Hey What\'s up?' },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const messagesEndRef = useRef(null);
    const streamTargetRef = useRef('');
    const streamDoneRef = useRef(false);
    const revealIntervalRef = useRef(null);

    // Track if we have successfully suggested a theme/tool
    const hasSuggestedThemeRef = useRef(false);
    // Track pending suggestion to wait for user confirmation
    const pendingSuggestionRef = useRef(null);

    useEffect(() => {
        try {
            initializeGemini();
        } catch (error) {
            console.error("Failed to initialize Gemini:", error);
            setMessages(prev => [...prev, { id: Date.now(), sender: 'agent', text: 'Error: Could not connect to AI service. Please check API key.' }]);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const userText = inputText.trim();
        const newMessage = { id: Date.now(), sender: 'user', text: userText };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        setIsLoading(true);

        const agentMsgId = Date.now() + 1;
        streamTargetRef.current = '';
        streamDoneRef.current = false;
        let displayLen = 0;

        setMessages(prev => [...prev, {
            id: agentMsgId,
            sender: 'agent',
            text: ''
        }]);

        // Smooth typewriter: reveal chars at a steady rate instead of in bursts
        revealIntervalRef.current = setInterval(() => {
            const target = streamTargetRef.current;
            if (displayLen < target.length) {
                const behind = target.length - displayLen;
                const step = behind > 80 ? 4 : behind > 40 ? 3 : 1;
                displayLen = Math.min(displayLen + step, target.length);
                setMessages(prev => prev.map(msg =>
                    msg.id === agentMsgId ? { ...msg, text: target.slice(0, displayLen) } : msg
                ));
            } else if (streamDoneRef.current) {
                clearInterval(revealIntervalRef.current);
            }
        }, 20);

        try {
            let systemInjection = "";
            let shouldAnalyzeTheme = !hasSuggestedThemeRef.current;

            // 1. Check if we are waiting for confirmation
            if (pendingSuggestionRef.current) {
                const confirmation = await analyzeConfirmation(userText);
                console.log("Confirmation usage:", confirmation);

                if (confirmation.isConfirmed) {
                    // User said YES -> Trigger the pending action
                    if (props.onThemeAction) {
                        const { type, target } = pendingSuggestionRef.current;
                        props.onThemeAction(type, target);
                    }
                    hasSuggestedThemeRef.current = true; // Mark as done
                    pendingSuggestionRef.current = null; // Clear pending
                    shouldAnalyzeTheme = false; // Don't re-analyze theme
                    systemInjection = `[SYSTEM: User confirmed suggestion. Action: Navigation triggered. Briefly acknowledge and encourage them.] `;
                } else {
                    // User said NO or ignored -> Clear pending, re-analyze?
                    pendingSuggestionRef.current = null;
                }
            }

            // 2. Analyze Theme (if not confirmed yet and nothing pending)
            if (shouldAnalyzeTheme) {
                const analysis = await analyzeTheme(userText);
                console.log("Analysis Result:", analysis);

                if (analysis.theme && analysis.theme !== 'Unclear') {
                    // Found a clear theme -> But do NOT trigger yet. Ask for confirmation.
                    let suggestedAction = null;

                    if (analysis.theme === 'Specificity') {
                        suggestedAction = { type: 'mode', target: 'visualizer' };
                        systemInjection = "[SYSTEM: Matches Theme: Specificity. Action: SUGGEST 'Visualizer'. Ask: 'Would you like to try the Visualizer to map this out?'] ";
                    } else if (analysis.theme === 'Complexity') {
                        suggestedAction = { type: 'mode', target: 'mind_map' };
                        systemInjection = "[SYSTEM: Matches Theme: Complexity. Action: SUGGEST 'Mind Map'. Ask: 'Would you like to use a Mind Map to organize your thoughts?'] ";
                    } else if (analysis.theme === 'Simplicity') {
                        if (analysis.targetGame) {
                            suggestedAction = { type: 'game', target: analysis.targetGame };
                            systemInjection = `[SYSTEM: Matches Theme: Simplicity/Emotion. Action: SUGGEST Game '${analysis.targetGame}'. Ask: 'Would you like to play ${analysis.targetGame} to help regulate this?'] `;
                        }
                    }

                    if (suggestedAction) {
                        pendingSuggestionRef.current = suggestedAction; // Store for NEXT turn
                        // Do NOT set hasSuggestedThemeRef.current = true yet. Only after confirmation.
                    }

                } else {
                    // Theme is Unclear
                    systemInjection = "[SYSTEM: Analysis: Unclear. Action: ASK CLARIFYING QUESTION. Do NOT give advice yet. Ask a specific question to categorize them into Specificity (Event), Complexity (Relationship), or Simplicity (Emotion).] ";
                }
            }

            // Contextualize the message based on sidebar mode
            let contextPrefix = "";
            if (sidebarMode) {
                const modeName = sidebarMode.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                contextPrefix = `[User is currently in "${modeName}" view] `;
            }

            // Send actual message with injected system instruction to guide the agent's response
            const fullPrompt = systemInjection + contextPrefix + userText;
            console.log("--- DEBUG: SENDING MESSAGE ---");
            console.log("System Injection:", systemInjection);
            console.log("Full Prompt:", fullPrompt);

            // Use streaming to update the UI in real-time
            const finalResponseText = await sendMessageStream(fullPrompt, (accumulated) => {
                streamTargetRef.current = accumulated;
            });

            // Assign to finalText for voice synthesis
            // (The variable name 'finalText' was used in the voice block below)
            var finalText = finalResponseText;

            streamDoneRef.current = true;

            if (voiceEnabled) {
                speakText(finalText).catch(console.error);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            clearInterval(revealIntervalRef.current);
            setMessages(prev => prev.map(msg =>
                msg.id === agentMsgId
                    ? { ...msg, text: "I'm sorry, I encountered an error responding to that." }
                    : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        return () => clearInterval(revealIntervalRef.current);
    }, []);

    const handleReset = () => {
        clearInterval(revealIntervalRef.current);
        resetChat();
        stopAudio();
        // Reset theme tracking on chat reset
        if (hasSuggestedThemeRef.current) hasSuggestedThemeRef.current = false;
        pendingSuggestionRef.current = null;
        if (onReset) onReset();
    };

    const toggleVoice = () => {
        if (voiceEnabled) {
            stopAudio();
        }
        setVoiceEnabled(!voiceEnabled);
    };

    return (
        <div className="chat-area">
            <div className="messages-list">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                        {msg.sender === 'agent' && msg.text === '' ? (
                            <span className="loading-dots">Thinking...</span>
                        ) : msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="input-area">
                <button
                    onClick={toggleVoice}
                    className="voice-button"
                    title={voiceEnabled ? "Voice On" : "Voice Off"}
                    style={{
                        marginRight: '10px',
                        backgroundColor: voiceEnabled ? '#4285f4' : '#6c757d',
                        fontSize: '16px',
                        padding: '8px 12px'
                    }}
                >
                    {voiceEnabled ? '🔊' : '🔇'}
                </button>
                <button onClick={handleReset} className="reset-button" title="Reset Chat" style={{ marginRight: '10px', backgroundColor: '#6c757d' }}>
                    ↺
                </button>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading}>
                    {isLoading ? '...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default ChatArea;
