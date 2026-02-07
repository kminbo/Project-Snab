import React, { useState, useMemo } from 'react';
import '../App.css';
import { getGames } from '../data/gameRegistry';
import { getGameCover } from '../utils/gameUtils';

const Sidebar = ({ mode, setMode }) => {
    const [activeGame, setActiveGame] = useState(null);
    const games = useMemo(() => getGames(), []);

    const handleGameClick = (game) => {
        setActiveGame(game);
        setMode('game_play');
    };

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
                    {games.map((game) => {
                        const coverImage = getGameCover(game.coverImage);
                        return (
                            <div
                                key={game.id}
                                className="game-tile"
                                onClick={() => handleGameClick(game)}
                                style={{
                                    backgroundImage: coverImage ? `url(${coverImage})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative' // For text positioning
                                }}
                            >
                                <div className="game-tile-overlay">
                                    {game.coverImage && !coverImage ? (
                                        // Fallback if image defined but not found (optional, or just show text)
                                        <span>{game.name}</span>
                                    ) : (
                                        <span className="game-title">{game.name}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // 3. Game Play
    if (mode === 'game_play') {
        const GameComponent = activeGame?.component;
        return (
            <div className="sidebar game-play">
                {renderBackButton('game_selection')}
                <div className="game-interface-wrapper">
                    {GameComponent ? <GameComponent /> : <div className="game-interface-placeholder">Game Not Found</div>}
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
