import React, { useState, useEffect, useRef } from 'react';

// Dimensions & Config
const CELL_SIZE = 10;
const BUTTON_HEIGHT_RESERVED = 60;
const MAZE_MARGIN = 20;

const GlitterMaze = () => {
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [maze, setMaze] = useState([]);
    const [COLS, setCOLS] = useState(0);
    const [ROWS, setROWS] = useState(0);
    const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
    const [gameActive, setGameActive] = useState(false);
    const [isWon, setIsWon] = useState(false);

    const keysPressed = useRef({});
    const lastMoveTime = useRef(0);
    const MOVE_DELAY = 50;

    // Calculate maze dimensions based on container size
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                const height = containerRef.current.offsetHeight;
                setContainerSize({ width, height });

                const availableWidth = width - (MAZE_MARGIN * 2);
                const availableHeight = height - BUTTON_HEIGHT_RESERVED - (MAZE_MARGIN * 2);

                const cols = Math.floor(availableWidth / CELL_SIZE) % 2 === 0
                    ? Math.floor(availableWidth / CELL_SIZE) - 1
                    : Math.floor(availableWidth / CELL_SIZE);
                const rows = Math.floor(availableHeight / CELL_SIZE) % 2 === 0
                    ? Math.floor(availableHeight / CELL_SIZE) - 1
                    : Math.floor(availableHeight / CELL_SIZE);

                setCOLS(cols);
                setROWS(rows);
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Initialize Game when dimensions are ready
    useEffect(() => {
        if (COLS > 0 && ROWS > 0) {
            startNewGame();
        }
    }, [COLS, ROWS]);

    const startNewGame = () => {
        if (COLS === 0 || ROWS === 0) return;
        const newMaze = generateMaze(COLS, ROWS);
        setMaze(newMaze);
        setPlayerPos({ x: 1, y: 1 });
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
        if (!gameActive || isWon || maze.length === 0) return;

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

                        if (newX >= 0 && newX < COLS && newY >= 0 && newY < ROWS) {
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
    }, [gameActive, isWon, maze, COLS, ROWS]);

    const checkWin = (x, y) => {
        if (y === ROWS - 1) {
            setIsWon(true);
            setGameActive(false);
        }
    };

    const generateMaze = (width, height) => {
        let grid = Array(height).fill().map(() => Array(width).fill(1));

        const dirs = [
            [0, -2], [0, 2], [-2, 0], [2, 0]
        ];

        const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const carve = (x, y) => {
            grid[y][x] = 0;

            const shuffledDirs = shuffle([...dirs]);

            for (let [dx, dy] of shuffledDirs) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && grid[ny][nx] === 1) {
                    grid[y + dy / 2][x + dx / 2] = 0;
                    carve(nx, ny);
                }
            }
        };

        carve(1, 1);

        if (grid[1][1] === 0) {
            grid[0][1] = 0;
        }

        if (width % 2 !== 0 && height % 2 !== 0) {
            grid[height - 1][width - 2] = 0;
            if (grid[height - 2][width - 2] === 1) {
                grid[height - 2][width - 2] = 0;
            }
        }

        return grid;
    };

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#eee',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '12px',
                overflow: 'hidden'
            }}
        >
            {/* Maze Container */}
            {maze.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
                    gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
                    backgroundColor: 'black',
                    position: 'relative',
                    width: 'fit-content',
                    margin: 'auto',
                    boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                }}>
                    {maze.map((row, rIndex) => (
                        row.map((cell, cIndex) => {
                            let backgroundColor = cell === 1 ? 'black' : 'white';

                            return (
                                <div key={`${rIndex}-${cIndex}`} style={{
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
                                    backgroundColor: backgroundColor,
                                    position: 'relative'
                                }}>
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
            )}

            {/* Win Message */}
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

            {/* Button */}
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

export default GlitterMaze;
