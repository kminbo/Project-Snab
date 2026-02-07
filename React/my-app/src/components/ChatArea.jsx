import React, { useState, useEffect, useRef } from 'react';
import { initializeGemini, sendMessage, resetChat } from '../gemini/geminiChat';
import { speakText, stopAudio } from '../gemini/elevenLabsVoice';

const ChatArea = ({ sidebarMode }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'agent', text: 'Hello! I am your mental health coach. How can I help you today?' },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const messagesEndRef = useRef(null);

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

        try {
            // Contextualize the message based on sidebar mode
            let contextPrefix = "";
            if (sidebarMode) {
                const modeName = sidebarMode.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                contextPrefix = `[User is currently in "${modeName}" view] `;
            }

            const responseText = await sendMessage(contextPrefix + userText);

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'agent',
                text: responseText
            }]);

            if (voiceEnabled) {
                speakText(responseText).catch(console.error);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'agent',
                text: "I'm sorry, I encountered an error responding to that."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        resetChat();
        stopAudio();
        setMessages([{ id: Date.now(), sender: 'agent', text: 'Chat reset. How can I help you now?' }]);
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
                        {msg.text}
                    </div>
                ))}
                {isLoading && (
                    <div className="message-bubble agent">
                        <span className="loading-dots">Thinking...</span>
                    </div>
                )}
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
