import React, { useState, useEffect, useRef } from 'react';
import { initializeGemini, sendMessageStream, resetChat } from '../gemini/geminiChat';
import { speakText, stopAudio } from '../gemini/elevenLabsVoice';

const ChatArea = ({ sidebarMode }) => {
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
            // Contextualize the message based on sidebar mode
            let contextPrefix = "";
            if (sidebarMode) {
                const modeName = sidebarMode.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                contextPrefix = `[User is currently in "${modeName}" view] `;
            }

            const finalText = await sendMessageStream(contextPrefix + userText, (accumulated) => {
                streamTargetRef.current = accumulated;
            });

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
