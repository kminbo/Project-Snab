import React, { useState, useEffect } from 'react';

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
    EMPTY: 'transparent' // or a specific background for the "hole"
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
// Row 0: 4 White, 1 Empty (at index 4 for example, but prompt says "to the left", implying empty is right)
// Rows 1-4: Cols 0=LB, 1=B, 2=Lav, 3=P, 4=M
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

const GameOne = () => {
    const [grid, setGrid] = useState(getSolvedGrid());
    const [isSolved, setIsSolved] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    // Initial Shuffle
    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        let currentGrid = getSolvedGrid();
        // Perform random valid moves to shuffle
        let emptyIndex = 4; // Starting empty position in solved grid
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
        if (isSolved) return;

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
        // We compare types. Since same-colored tiles are identical, this works.
        const isWin = currentGrid.every((tile, i) => tile === solved[i]);
        if (isWin) {
            setIsSolved(true);
        }
    };

    const getTileColor = (type) => {
        return COLORS[type] || 'transparent';
    };

    return (
        <div style={{
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            position: 'relative',
            backgroundColor: '#333', // Background for container
            border: '1px solid black',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px'
        }}>
            {/* Grid Container */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gridTemplateRows: 'repeat(5, 1fr)',
                width: '100%',
                aspectRatio: '1 / 1', // Ensures square tiles as grid is 5x5 and container width is fixed
            }}>
                {grid.map((type, index) => (
                    <div
                        key={index}
                        onClick={() => handleTileClick(index)}
                        style={{
                            backgroundColor: getTileColor(type),
                            border: type === TILE_TYPES.EMPTY ? 'none' : '1px solid rgba(0,0,0,0.1)',
                            cursor: (type !== TILE_TYPES.EMPTY && !isSolved) ? 'pointer' : 'default',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            transition: 'background-color 0.2s',
                            boxSizing: 'border-box',
                            color: type === TILE_TYPES.EMPTY ? '#888' : 'black', // Text color for N/A
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        {type === TILE_TYPES.EMPTY ? "N/A" : ""}
                    </div>
                ))}
            </div>

            {/* Leave Game / Reset Button */}
            {/* 
               Prompt: "Create a button to let the user leave the game whenever he/she wants to. 
               If the user clicks this button, the puzzle will reset"
               Ordering: It seems "Leave" implies "Exit", but the action described is "reset". 
               I'll label it "Restart" or "Leave Game" and have it reset.
            */}
            <button
                onClick={startNewGame}
                style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    zIndex: 10
                }}
            >
                {isSolved ? 'Play Again' : 'Reset Game'}
            </button>

            {isSolved && (
                <div style={{
                    position: 'absolute',
                    top: '30%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 255, 0, 0.8)',
                    padding: '20px',
                    borderRadius: '10px',
                    color: 'white',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    zIndex: 20
                }}>
                    SOLVED!
                </div>
            )}
        </div>
    );
};

export default GameOne;
