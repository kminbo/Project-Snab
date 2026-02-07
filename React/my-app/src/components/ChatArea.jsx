import React, { useState } from 'react';

const ChatArea = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'agent', text: 'Hello! How can I help you today?' },
    ]);
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (inputText.trim()) {
            setMessages([...messages, { id: Date.now(), sender: 'user', text: inputText }]);
            setInputText('');
        }
    };

    return (
        <div className="chat-area">
            <div className="messages-list">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="input-area">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default ChatArea;
