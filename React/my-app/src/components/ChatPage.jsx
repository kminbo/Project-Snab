import React, { useState } from 'react';
import ChatArea from './ChatArea';
import Sidebar from './Sidebar';
import '../App.css';

const ChatPage = () => {
    const [sidebarMode, setSidebarMode] = useState('mode_selection');

    return (
        <div className="chat-page">
            <div className="chat-area-container">
                <ChatArea sidebarMode={sidebarMode} />
            </div>
            <div className="sidebar-container">
                <Sidebar mode={sidebarMode} setMode={setSidebarMode} />
            </div>
        </div>
    );
};

export default ChatPage;
