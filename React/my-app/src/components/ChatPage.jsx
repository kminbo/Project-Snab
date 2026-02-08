import React, { useState } from 'react';
import ChatArea from './ChatArea';
import Sidebar from './Sidebar';
import '../App.css';

const ChatPage = () => {
    const [resetKey, setResetKey] = useState(0);
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

    const handleReset = () => {
        setSidebarMode('mode_selection');
        setResetKey(k => k + 1);
    };

    return (
        <div className="chat-page" key={resetKey}>
            <div className="chat-area-container">
                <ChatArea sidebarMode={sidebarMode} onThemeAction={handleThemeAction} onReset={handleReset} />
            </div>
            <div className="sidebar-container">
                <Sidebar ref={sidebarRef} mode={sidebarMode} setMode={setSidebarMode} />
            </div>
        </div>
    );
};

export default ChatPage;
