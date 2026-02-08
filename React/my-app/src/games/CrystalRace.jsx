import React, { useState, useEffect } from 'react';
import crystalOne from './symbols/crystal-one.PNG';
import crystalTwo from './symbols/crystal-two.PNG';
import crystalThree from './symbols/crystal-three.PNG';
import crystalFour from './symbols/crystal-four.PNG';
import crystalFive from './symbols/crystal-five.PNG';

// Screen Dimensions
const SCREEN_WIDTH = '256.522px';
const SCREEN_HEIGHT = '773.044px';

// Colors (Approximate matches for standard names)
const COLORS = {
    WHITE: '#FFFFFF',
    LIGHT_BLUE: '#1783ffff',
    BLUE: '#0000dfff',
    LAVENDER: '#00ffa6ff',
    PURPLE: '#800080',
    MAGENTA: '#FF00FF',
    EMPTY: '#000000' // Black color for the empty tile
};

// Tile Types
const TILE_TYPES = {
    WHITE: 'WHITE',
    LIGHT_BLUE: 'LIGHT_BLUE',
    BLUE: 'BLUE',
    LAVENDER: 'LAVENDER',
    PURPLE: 'PURPLE',
    MAGENTA: 'MAGENTA',
    EMPTY: 'EMPTY'
};

// Solved Configuration (5x5)
const getSolvedGrid = () => {
    const grid = [];

    // Row 0
    grid.push(TILE_TYPES.WHITE);
    grid.push(TILE_TYPES.WHITE);
    grid.push(TILE_TYPES.WHITE);
    grid.push(TILE_TYPES.WHITE);
    grid.push(TILE_TYPES.EMPTY);

    // Rows 1-4
    for (let r = 1; r < 5; r++) {
        grid.push(TILE_TYPES.LIGHT_BLUE);
        grid.push(TILE_TYPES.BLUE);
        grid.push(TILE_TYPES.LAVENDER);
        grid.push(TILE_TYPES.PURPLE);
        grid.push(TILE_TYPES.MAGENTA);
    }
    return grid;
};

const CrystalRace = () => {
    const [grid, setGrid] = useState(getSolvedGrid());
    const [isSolved, setIsSolved] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const handleShuffle = () => {
        let currentGrid = getSolvedGrid();
        // Perform random valid moves to shuffle
        let emptyIndex = 4; // Starting empty position in solved grid (now position [0,4])
        let previousIndex = -1;

        for (let i = 0; i < 200; i++) {
            const neighbors = getNeighbors(emptyIndex);
            // Avoid immediately undoing the last move if possible
            const validNeighbors = neighbors.filter(n => n !== previousIndex);
            const moveIndex = validNeighbors.length > 0
                ? validNeighbors[Math.floor(Math.random() * validNeighbors.length)]
                : neighbors[Math.floor(Math.random() * neighbors.length)];

            // Swap
            swap(currentGrid, emptyIndex, moveIndex);
            previousIndex = emptyIndex;
            emptyIndex = moveIndex;
        }

        setGrid([...currentGrid]);
        setGameStarted(true);
        setIsSolved(false);
    };

    const handleRestart = () => {
        setGrid(getSolvedGrid());
        setGameStarted(false);
        setIsSolved(false);
    };

    const getNeighbors = (index) => {
        const neighbors = [];
        const row = Math.floor(index / 5);
        const col = index % 5;

        if (row > 0) neighbors.push(index - 5); // Up
        if (row < 4) neighbors.push(index + 5); // Down
        if (col > 0) neighbors.push(index - 1); // Left
        if (col < 4) neighbors.push(index + 1); // Right

        return neighbors;
    };

    const swap = (arr, i, j) => {
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    };

    const handleTileClick = (index) => {
        if (!gameStarted || isSolved) return;

        const emptyIndex = grid.indexOf(TILE_TYPES.EMPTY);
        const neighbors = getNeighbors(emptyIndex);

        if (neighbors.includes(index)) {
            const newGrid = [...grid];
            swap(newGrid, emptyIndex, index);
            setGrid(newGrid);
            checkWin(newGrid);
        }
    };

    const checkWin = (currentGrid) => {
        const solved = getSolvedGrid();
        const isWin = currentGrid.every((tile, i) => tile === solved[i]);
        if (isWin) {
            setIsSolved(true);
        }
    };

    const getTileColor = (type) => {
        return COLORS[type] || 'transparent';
    };

    const getCrystalImage = (type) => {
        switch (type) {
            case TILE_TYPES.LIGHT_BLUE:
                return crystalOne;
            case TILE_TYPES.BLUE:
                return crystalTwo;
            case TILE_TYPES.LAVENDER:
                return crystalThree;
            case TILE_TYPES.PURPLE:
                return crystalFour;
            case TILE_TYPES.MAGENTA:
                return crystalFive;
            default:
                return null;
        }
    };

    return (
        <div style={{
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            position: 'relative',
            backgroundColor: '#333',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '20px',
            paddingBottom: '20px',
            paddingLeft: '20px',
            paddingRight: '20px',
            boxSizing: 'border-box',
            gap: '100px'
        }}>
            {/* Grid Container */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gridTemplateRows: '55.4px repeat(4, 1fr)',
                width: '220px',
                height: '220px',
                gap: '2px'
            }}>
                {grid.map((type, index) => (
                    <div
                        key={index}
                        onClick={() => handleTileClick(index)}
                        style={{
                            backgroundColor: getTileColor(type),
                            border: type === TILE_TYPES.EMPTY ? 'none' : '1px solid rgba(0,0,0,0.1)',
                            cursor: (type !== TILE_TYPES.EMPTY && gameStarted && !isSolved) ? 'pointer' : 'default',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            transition: 'background-color 0.2s',
                            boxSizing: 'border-box',
                            position: 'relative',
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        {type === TILE_TYPES.EMPTY ? (
                            <span style={{ color: '#888', fontSize: '14px', fontWeight: 'bold' }}>N/A</span>
                        ) : getCrystalImage(type) ? (
                            <img
                                src={getCrystalImage(type)}
                                alt="crystal"
                                style={{
                                    width: '80%',
                                    height: '80%',
                                    objectFit: 'contain',
                                    pointerEvents: 'none'
                                }}
                            />
                        ) : null}
                    </div>
                ))}
            </div>

            <button
                onClick={gameStarted ? handleRestart : handleShuffle}
                style={{
                    padding: '10px 20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '2px solid #ccc',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    zIndex: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
            >
                {gameStarted ? 'Restart' : 'Shuffle'}
            </button>

            {isSolved && (
                <div style={{
                    position: 'absolute',
                    top: '35%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 255, 0, 0.9)',
                    padding: '20px 30px',
                    borderRadius: '10px',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '24px',
                    pointerEvents: 'none',
                    zIndex: 20,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}>
                    SOLVED!
                </div>
            )}
        </div>
    );
};

export default CrystalRace;
