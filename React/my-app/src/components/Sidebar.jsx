import React, { useState, useMemo } from 'react';
import { Reorder } from 'framer-motion';
import '../App.css';
import { getGames } from '../data/gameRegistry';
import { getGameCover } from '../utils/gameUtils';
import gamesCover from '../assets/ModeCovers/games-cover.jpg';
import mindMapCover from '../assets/ModeCovers/mind-map-cover.jpg';
import visualizerCover from '../assets/ModeCovers/visualizer-cover.jpg';

const Sidebar = ({ mode, setMode }) => {
    const [activeGame, setActiveGame] = useState(null);

    // Initialize standard games list
    const initialGames = useMemo(() => getGames(), []);

    // Initialize mode tiles state
    const [modeTiles, setModeTiles] = useState([
        { id: 'game_selection', label: 'Games', coverImage: gamesCover },
        { id: 'mind_map', label: 'Mind Map', coverImage: mindMapCover },
        { id: 'visualizer', label: 'Visualizer', coverImage: visualizerCover }
    ]);

    // Initialize game tiles state
    const [gameTiles, setGameTiles] = useState(initialGames);

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

    // Programmatic reordering functions (available w/in code)
    const shuffleModeTiles = () => {
        const shuffled = [...modeTiles].sort(() => Math.random() - 0.5);
        setModeTiles(shuffled);
    };

    const shuffleGameTiles = () => {
        const shuffled = [...gameTiles].sort(() => Math.random() - 0.5);
        setGameTiles(shuffled);
    };

    // 1. Mode Selection (Default)
    if (mode === 'mode_selection') {
        return (
            <div className="sidebar mode-selection">
                <Reorder.Group axis="y" values={modeTiles} onReorder={setModeTiles} className="reorder-group" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {modeTiles.map((tile) => (
                        <Reorder.Item key={tile.id} value={tile} className="mode-tile-wrapper" style={{ listStyle: 'none' }}>
                            <div
                                className="game-tile"
                                onClick={() => setMode(tile.id)}
                                style={{
                                    backgroundImage: `url(${tile.coverImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative'
                                }}
                            >
                                <div className="game-tile-overlay">
                                    <span className="game-title">{tile.label}</span>
                                </div>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
                {/* valid "within code" usage example: hidden by default or dev-only */}
                {/* <button onClick={shuffleModeTiles} style={{marginTop: 'auto', fontSize: '0.8rem'}}>Shuffle (Debug)</button> */}
            </div>
        );
    }

    // 2. Game Selection
    if (mode === 'game_selection') {
        return (
            <div className="sidebar game-selection">
                {renderBackButton('mode_selection')}
                <h3>Select a Game</h3>
                <Reorder.Group axis="y" values={gameTiles} onReorder={setGameTiles} className="game-list reorder-group">
                    {gameTiles.map((game) => {
                        const coverImage = getGameCover(game.coverImage);
                        return (
                            <Reorder.Item key={game.id} value={game} className="game-tile-wrapper">
                                <div
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
                            </Reorder.Item>
                        );
                    })}
                </Reorder.Group>
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
