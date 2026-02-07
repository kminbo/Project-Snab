import React from 'react';
import '../App.css';

const Sidebar = ({ mode, setMode }) => {
    // Helper to render the back button
    const renderBackButton = (targetMode) => (
        <button className="back-button" onClick={() => setMode(targetMode)}>
            ← Back
        </button>
    );

    // 1. Mode Selection (Default)
    if (mode === 'mode_selection') {
        return (
            <div className="sidebar mode-selection">
                <div className="mode-tile" onClick={() => setMode('game_selection')}>
                    Games
                </div>
                <div className="mode-tile" onClick={() => setMode('mind_map')}>
                    Mind Map
                </div>
                <div className="mode-tile" onClick={() => setMode('visualizer')}>
                    Visualizer
                </div>
            </div>
        );
    }

    // 2. Game Selection
    if (mode === 'game_selection') {
        return (
            <div className="sidebar game-selection">
                {renderBackButton('mode_selection')}
                <h3>Select a Game</h3>
                <div className="game-list">
                    {[1, 2, 3, 4, 5].map((gameId) => (
                        <div
                            key={gameId}
                            className="game-tile"
                            onClick={() => setMode('game_play')}
                        >
                            Game {gameId}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 3. Game Play
    if (mode === 'game_play') {
        return (
            <div className="sidebar game-play">
                {renderBackButton('game_selection')}
                <div className="game-interface-placeholder">
                    Active Game Interface
                </div>
            </div>
        );
    }

    // 4. Mind Map
    if (mode === 'mind_map') {
        return (
            <div className="sidebar mind-map">
                {renderBackButton('mode_selection')}
                <div className="placeholder-content">
                    Mind Map Interface
                </div>
            </div>
        );
    }

    // 5. Visualizer
    if (mode === 'visualizer') {
        return (
            <div className="sidebar visualizer">
                {renderBackButton('mode_selection')}
                <div className="placeholder-content">
                    Visualizer Interface
                </div>
            </div>
        );
    }

    return <div className="sidebar">Unknown Mode</div>;
};

export default Sidebar;
