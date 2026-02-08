import React, { useState } from 'react';
import ChatArea from './ChatArea';
import Sidebar from './Sidebar';
import '../App.css';

// Layout component for the main chat experience
const ChatPage = () => {
    // Unique key to force a full re-render when the session is reset
    const [resetKey, setResetKey] = useState(0);
    // Controls which view is currently shown in the sidebar (games, mind map, etc.)
    const [sidebarMode, setSidebarMode] = useState('mode_selection');
    const sidebarRef = React.useRef(null);

    // Processes actions triggered by the AI, such as suggesting and reordering sidebar tools
    const handleThemeAction = (type, target) => {
        if (!sidebarRef.current) return;

        if (type === 'mode') {
            // Reorders the top-level modes (e.g., brings Mind Map to the top)
            sidebarRef.current.reorderModeTiles(target);
        } else if (type === 'game') {
            // Reorders specific games within the game selection view
            sidebarRef.current.reorderGameTiles(target);
        }
    };

    // Resets the entire chat session and returns the sidebar to the selection menu
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
