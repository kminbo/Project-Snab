import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Reorder } from 'framer-motion';
import '../App.css';
import { getGames } from '../data/gameRegistry';
import { getGameCover } from '../utils/gameUtils';
import MindMap from './MindMap';
import gamesCover from '../assets/ModeCovers/games-cover.jpg';
import mindMapCover from '../assets/ModeCovers/mind-map-cover.jpg';
import visualizerCover from '../assets/ModeCovers/visualizer-cover.jpg';
import mindMapPlaceholder from '../assets/placeholders/mind-map-placeholder.jpg';
import visualizerPlaceholder from '../assets/placeholders/visualizer-placeholder.jpg';

// Sidebar component that manages and displays therapeutic tools and games
const Sidebar = forwardRef(({ mode, setMode }, ref) => {
    // State to track the currently playing game
    const [activeGame, setActiveGame] = useState(null);
    // State to highlight a specific tile when the AI suggests it
    const [suggestedTileId, setSuggestedTileId] = useState(null);

    // Initialize list of games and their metadata
    const initialGames = useMemo(() => getGames(), []);

    // State for the main mode categories (Games, Mind Map, Visualizer)
    const [modeTiles, setModeTiles] = useState([
        { id: 'game_selection', label: 'Games', coverImage: gamesCover },
        { id: 'mind_map', label: 'Mind Map', coverImage: mindMapCover },
        { id: 'visualizer', label: 'Visualizer', coverImage: visualizerCover }
    ]);

    // State for the individual game items
    const [gameTiles, setGameTiles] = useState(initialGames);

    // Exposes methods to the parent component to allow AI-driven reordering
    useImperativeHandle(ref, () => ({
        // Moves a specific mode (like Mind Map) to the top of the list and navigates to it
        reorderModeTiles: (targetModeId) => {
            const index = modeTiles.findIndex(t => t.id === targetModeId);
            if (index > -1) {
                const newTiles = [...modeTiles];
                const [targetTile] = newTiles.splice(index, 1);
                newTiles.unshift(targetTile);
                setModeTiles(newTiles);
                setMode(targetModeId); 
                setSuggestedTileId(targetModeId); 
            }
        },
        // Moves a specific game to the top of the game selection list
        reorderGameTiles: (targetGameName) => {
            const index = gameTiles.findIndex(g => g.name === targetGameName);
            if (index > -1) {
                const newTiles = [...gameTiles];
                const [targetTile] = newTiles.splice(index, 1);
                newTiles.unshift(targetTile);
                setGameTiles(newTiles);
                setMode('game_selection'); 
                setSuggestedTileId(targetTile.id); 
            }
        }
    }));

    // Handles user selection of a game to start playing it
    const handleGameClick = (game) => {
        setActiveGame(game);
        setMode('game_play');
        if (suggestedTileId === game.id) {
            setSuggestedTileId(null); // Remove highlight on click
        }
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
                <Reorder.Group axis="y" values={modeTiles} onReorder={setModeTiles} className="reorder-group" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', padding: 0 }}>
                    {modeTiles.map((tile) => (
                        <Reorder.Item key={tile.id} value={tile} className="mode-tile-wrapper" style={{ listStyle: 'none' }}>
                            <div
                                className={`game-tile ${suggestedTileId === tile.id ? 'suggested-tile-glow' : ''}`}
                                onClick={() => {
                                    setMode(tile.id);
                                    if (suggestedTileId === tile.id) setSuggestedTileId(null);
                                }}
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
                                    className={`game-tile ${suggestedTileId === game.id ? 'suggested-tile-glow' : ''}`}
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
                <div
                    className="mind-map-placeholder"
                    style={{
                        backgroundImage: `url(${mindMapPlaceholder})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'top center',
                        width: '100%',
                        height: '100%',
                        borderRadius: '12px'
                    }}
                />
            </div>
        );
    }


    // 5. Visualizer
    if (mode === 'visualizer') {
        return (
            <div className="sidebar visualizer">
                {renderBackButton('mode_selection')}
                    <div
                        className="visualizer-placeholder"
                        style={{
                            backgroundImage: `url(${visualizerPlaceholder})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'top center',
                            width: '100%',
                            height: '100%',
                            borderRadius: '12px'
                        }}
                    />
            </div>
        );
    }


    return <div className="sidebar">Unknown Mode</div>;
});

export default Sidebar;



