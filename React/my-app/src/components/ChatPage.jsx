import React, { useState } from 'react';
import ChatArea from './ChatArea';
import Sidebar from './Sidebar';
import '../App.css';

const ChatPage = () => {
    const [sidebarMode, setSidebarMode] = useState('mode_selection');
    const sidebarRef = React.useRef(null);
    const handleThemeAction = (type, target) => {
        if (!sidebarRef.current) return;

        if (type === 'mode') {
            sidebarRef.current.reorderModeTiles(target);
        } else if (type === 'game') {
            sidebarRef.current.reorderGameTiles(target);
        }
    };

    return (
        <div className="chat-page">
            <div className="chat-area-container">
                <ChatArea sidebarMode={sidebarMode} onThemeAction={handleThemeAction} />
            </div>
            <div className="sidebar-container">
                <Sidebar ref={sidebarRef} mode={sidebarMode} setMode={setSidebarMode} />
            </div>
        </div>
    );
};

export default ChatPage;
