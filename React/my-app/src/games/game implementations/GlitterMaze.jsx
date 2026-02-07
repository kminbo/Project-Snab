import React, { useState, useEffect, useRef } from 'react';

// Dimensions & Config
const SCREEN_WIDTH_PX = 256.522;
const SCREEN_HEIGHT_PX = 773.044;

const CELL_SIZE = 10; // Smaller pixels for "small pixel" look
const BUTTON_HEIGHT_RESERVED = 60; // Space at bottom for button
const MAZE_MARGIN = 20; // NEW: Margin around the maze to make it smaller

const AVAILABLE_WIDTH = SCREEN_WIDTH_PX - (MAZE_MARGIN * 2);
const AVAILABLE_HEIGHT = SCREEN_HEIGHT_PX - BUTTON_HEIGHT_RESERVED - (MAZE_MARGIN * 2);

// Calculate Rows/Cols to fit (Odd numbers preferred for maze algos usually)
// Force odd numbers
const COLS = Math.floor(AVAILABLE_WIDTH / CELL_SIZE) % 2 === 0 ? Math.floor(AVAILABLE_WIDTH / CELL_SIZE) - 1 : Math.floor(AVAILABLE_WIDTH / CELL_SIZE);
const ROWS = Math.floor(AVAILABLE_HEIGHT / CELL_SIZE) % 2 === 0 ? Math.floor(AVAILABLE_HEIGHT / CELL_SIZE) - 1 : Math.floor(AVAILABLE_HEIGHT / CELL_SIZE);

// Colors
const COLOR_WALL = 'black';
const COLOR_PATH = 'white';

const GameThree = () => {
    const [maze, setMaze] = useState([]);
    const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
    const [gameActive, setGameActive] = useState(false);
    const [isWon, setIsWon] = useState(false);

    // Movement Logic
    const keysPressed = useRef({});
    const lastMoveTime = useRef(0);
    const MOVE_DELAY = 50; // ms check interval for smooth but controlled speed (20 moves/sec max)

    // Initialize Game
    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        const newMaze = generateMaze(COLS, ROWS);
        setMaze(newMaze);
        setPlayerPos({ x: 1, y: 1 }); // Start just inside the top opening
        setGameActive(true);
        setIsWon(false);
    };

    // Input Handling
    useEffect(() => {
        const handleKeyDown = (e) => keysPressed.current[e.key] = true;
        const handleKeyUp = (e) => keysPressed.current[e.key] = false;

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Game Loop for Movement
    useEffect(() => {
        if (!gameActive || isWon) return;

        let animationFrameId;

        const update = (time) => {
            if (time - lastMoveTime.current > MOVE_DELAY) {
                lastMoveTime.current = time;

                let dx = 0;
                let dy = 0;

                if (keysPressed.current['ArrowUp']) dy = -1;
                else if (keysPressed.current['ArrowDown']) dy = 1;
                else if (keysPressed.current['ArrowLeft']) dx = -1;
                else if (keysPressed.current['ArrowRight']) dx = 1;

                if (dx !== 0 || dy !== 0) {
                    setPlayerPos(prev => {
                        const newX = prev.x + dx;
                        const newY = prev.y + dy;

                        // Check bounds and wall collision
                        if (newX >= 0 && newX < COLS && newY >= 0 && newY < ROWS) {
                            // Check Wall
                            // With async state update, 'maze' might be stale in closure? 
                            // Actually 'maze' is state, and this effect runs on [gameActive, isWon, maze].
                            // So 'maze' is fresh.
                            if (maze[newY] && maze[newY][newX] === 0) {
                                checkWin(newX, newY);
                                return { x: newX, y: newY };
                            }
                        }
                        return prev;
                    });
                }
            }
            animationFrameId = requestAnimationFrame(update);
        };

        animationFrameId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameActive, isWon, maze]); // Depend on maze to ensure collision checks correct maze

    const isValidMove = (x, y, currentMaze) => {
        if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
        return currentMaze[y][x] === 0; // 0 is path
    };

    const checkWin = (x, y) => {
        // End is at (COLS-2, ROWS-1) - The bottom opening
        // Or if stick figure reaches the very bottom row (ROWS-1)
        if (y === ROWS - 1) {
            setIsWon(true);
            setGameActive(false);
        }
    };

    // Recursive Backtracker Maze Generation
    const generateMaze = (width, height) => {
        // Initialize grid with walls (1)
        let grid = Array(height).fill().map(() => Array(width).fill(1));

        const dirs = [
            [0, -2], // Up
            [0, 2],  // Down
            [-2, 0], // Left
            [2, 0]   // Right
        ];

        const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const carve = (x, y) => {
            grid[y][x] = 0; // Mark current cell as path

            const shuffledDirs = shuffle([...dirs]);

            for (let [dx, dy] of shuffledDirs) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && grid[ny][nx] === 1) {
                    grid[y + dy / 2][x + dx / 2] = 0; // Carve wall between
                    carve(nx, ny);
                }
            }
        };

        // Start generating from (1,1)
        carve(1, 1);

        // Enhance: Create Start Opening at Top
        if (grid[1][1] === 0) {
            grid[0][1] = 0; // Open top wall above start
        }

        // Enhance: Create End Opening at Bottom
        // Find a path cell near bottom-right to open up
        // Since we carve recursively, (width-2, height-2) is likely visited but let's check.
        // Or just force path to bottom.
        // Let's open (width-2, height-1) if (width-2, height-2) is path.
        // Actually, just find the lowest path cell in the random maze? 
        // No, standard is usually bottom-right.
        // Let's ensure bottom-right area is accessible. 
        // Recursive backtracker fills all reachable areas, so (width-2, height-2) *should* be 0 if width/height are odd.
        if (width % 2 !== 0 && height % 2 !== 0) {
            grid[height - 1][width - 2] = 0; // Open bottom wall
            if (grid[height - 2][width - 2] === 1) {
                // Force a connection if algorithm somehow missed it (unlikely for odd dims)
                grid[height - 2][width - 2] = 0;
            }
        }

        return grid;
    };

    return (
        <div style={{
            width: `${SCREEN_WIDTH_PX}px`,
            height: `${SCREEN_HEIGHT_PX}px`,
            backgroundColor: '#eee',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between', // Push button to bottom
            alignItems: 'center',
            border: '1px solid black',
            overflow: 'hidden'
        }}>
            {/* Maze Container */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
                backgroundColor: COLOR_WALL,
                borderBottom: '2px solid black', // Separator
                position: 'relative',
                width: 'fit-content', // Shrink to fit grid
                margin: 'auto', // Center in the flex container
                boxShadow: '0 0 10px rgba(0,0,0,0.2)' // Add some depth since it's floating now
            }}>
                {maze.map((row, rIndex) => (
                    row.map((cell, cIndex) => {
                        let backgroundColor = cell === 1 ? COLOR_WALL : COLOR_PATH;

                        // No specific color for start/end, just holes (which are 0 aka path color)

                        return (
                            <div key={`${rIndex}-${cIndex}`} style={{
                                width: CELL_SIZE,
                                height: CELL_SIZE,
                                backgroundColor: backgroundColor,
                                position: 'relative'
                            }}>
                                {/* Player Stick Figure */}
                                {playerPos.x === cIndex && playerPos.y === rIndex && (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        zIndex: 10
                                    }}>
                                        <svg width="10" height="10" viewBox="0 0 10 10">
                                            <circle cx="5" cy="2" r="1.5" fill="none" stroke="blue" strokeWidth="1" />
                                            <line x1="5" y1="3.5" x2="5" y2="7" stroke="blue" strokeWidth="1" />
                                            <line x1="5" y1="5" x2="3" y2="4" stroke="blue" strokeWidth="1" />
                                            <line x1="5" y1="5" x2="7" y2="4" stroke="blue" strokeWidth="1" />
                                            <line x1="5" y1="7" x2="3" y2="9" stroke="blue" strokeWidth="1" />
                                            <line x1="5" y1="7" x2="7" y2="9" stroke="blue" strokeWidth="1" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ))}
            </div>

            {/* Win Message Overlay */}
            {isWon && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '2px solid green',
                    textAlign: 'center',
                    zIndex: 20
                }}>
                    <h2 style={{ color: 'green', margin: 0 }}>You Escaped!</h2>
                </div>
            )}

            {/* Exit/Reset Button Area */}
            <div style={{
                height: `${BUTTON_HEIGHT_RESERVED}px`,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #ddd'
            }}>
                <button
                    onClick={startNewGame}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#d9534f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    {isWon ? 'Play Again' : 'Reset Maze'}
                </button>
            </div>
        </div>
    );
};

export default GameThree;
