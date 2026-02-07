import React, { useState, useEffect, useRef } from 'react';

// Dimensions
const SCREEN_WIDTH = 256.522; // Using number for calculations
const SCREEN_HEIGHT = 773.044;
const GAME_AREA_WIDTH = SCREEN_WIDTH;
const GAME_AREA_HEIGHT = 600; // Playspace height within container

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const STAR_SIZE = 35; // Bigger stars
const PLAYER_SPEED = 5;
const STAR_SPEED = 1.5; // Slower stars
const SPAWN_RATE = 0.02; // Chance per frame

const GameTwo = () => {
    const [score, setScore] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [magicianX, setMagicianX] = useState(GAME_AREA_WIDTH / 2 - PLAYER_WIDTH / 2);
    const [stars, setStars] = useState([]); // Array of { id, x, y }

    const requestRef = useRef();
    const keysPressed = useRef({});

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

    // Game Loop
    const updateGame = () => {
        if (!gameActive) return;

        // Move Player
        setMagicianX((prevX) => {
            let newX = prevX;
            if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
                newX -= PLAYER_SPEED;
            }
            if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
                newX += PLAYER_SPEED;
            }
            // Clamp to bounds
            return Math.max(0, Math.min(GAME_AREA_WIDTH - PLAYER_WIDTH, newX));
        });

        // Update Stars
        setStars((prevStars) => {
            const nextStars = [];
            // Move existing stars
            prevStars.forEach(star => {
                const nextY = star.y + STAR_SPEED;

                // Check Collision
                // Simple AABB
                // Player box: magicianX, GAME_AREA_HEIGHT - PLAYER_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT
                // Star box: star.x, nextY, STAR_SIZE, STAR_SIZE
                const playerY = GAME_AREA_HEIGHT - PLAYER_HEIGHT;

                const collision = (
                    star.x < magicianX + PLAYER_WIDTH &&
                    star.x + STAR_SIZE > magicianX &&
                    nextY < playerY + PLAYER_HEIGHT &&
                    nextY + STAR_SIZE > playerY
                );

                if (collision) {
                    setScore(s => s + 1);
                    // Don't add to nextStars (remove it)
                } else if (nextY < GAME_AREA_HEIGHT) {
                    nextStars.push({ ...star, y: nextY });
                }
            });

            // Spawn new stars
            if (Math.random() < SPAWN_RATE) {
                nextStars.push({
                    id: Date.now() + Math.random(),
                    x: Math.random() * (GAME_AREA_WIDTH - STAR_SIZE),
                    y: 0
                });
            }

            return nextStars;
        });

        requestRef.current = requestAnimationFrame(updateGame);
    };

    useEffect(() => {
        if (gameActive) {
            requestRef.current = requestAnimationFrame(updateGame);
        } else {
            cancelAnimationFrame(requestRef.current);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameActive, magicianX]); // Dependency on magicianX needed if strictly capturing closure, but using functional updates avoids stale state for X? Actually updateGame closes over stale state if not careful.
    // Better pattern for game loop in React: either use ref for all mutable state OR functional state updates exclusively.
    // Here we used functional updates for setStars and setMagicianX, but collision check needs current magicianX.
    // We should use a ref for magicianX to access typically inside the loop without dependency churn.

    // Ref-based state for loop access
    const magicianXRef = useRef(GAME_AREA_WIDTH / 2 - PLAYER_WIDTH / 2);
    useEffect(() => {
        magicianXRef.current = magicianX;
    }, [magicianX]);

    // Re-implement loop to use Refs for logic to avoid effect re-triggering
    // We'll use a single effect for the loop
    useEffect(() => {
        if (!gameActive) return;

        const loop = () => {
            // Player Logic from Refs/Keys
            let currentX = magicianXRef.current;
            if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
                currentX -= PLAYER_SPEED;
            }
            if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
                currentX += PLAYER_SPEED;
            }
            currentX = Math.max(0, Math.min(GAME_AREA_WIDTH - PLAYER_WIDTH, currentX));

            // Update React State for Render
            setMagicianX(currentX); // This triggers re-render, fine for 60fps usually
            // Ideally we'd separate game loop logic from React render cycle if performance was critical, but for this simple game it's okay.

            setStars(prevStars => {
                const nextStars = [];
                prevStars.forEach(star => {
                    const nextY = star.y + STAR_SPEED;
                    const playerY = GAME_AREA_HEIGHT - PLAYER_HEIGHT;

                    const collision = (
                        star.x < currentX + PLAYER_WIDTH &&
                        star.x + STAR_SIZE > currentX &&
                        nextY < playerY + PLAYER_HEIGHT &&
                        nextY + STAR_SIZE > playerY
                    );

                    if (collision) {
                        setScore(s => s + 1);
                    } else if (nextY < GAME_AREA_HEIGHT) {
                        nextStars.push({ ...star, y: nextY });
                    }
                });

                if (Math.random() < SPAWN_RATE) {
                    nextStars.push({
                        id: Date.now() + Math.random(),
                        x: Math.random() * (GAME_AREA_WIDTH - STAR_SIZE),
                        y: 0
                    });
                }
                return nextStars;
            });

            requestRef.current = requestAnimationFrame(loop);
        };
        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameActive]);


    const startGame = () => {
        setScore(0);
        setStars([]);
        setMagicianX(GAME_AREA_WIDTH / 2 - PLAYER_WIDTH / 2);
        setGameActive(true);
    };

    const stopGame = () => {
        setGameActive(false);
        setStars([]);
    };

    return (
        <div style={{
            width: `${SCREEN_WIDTH}px`,
            height: `${SCREEN_HEIGHT}px`,
            backgroundColor: '#222',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // Vertically Centered
            alignItems: 'center',
            overflow: 'hidden',
            color: 'white'
        }}>
            {/* Score (Outside Game Area) */}
            <div style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold' }}>
                Score: {score}
            </div>

            {/* Game Area */}
            <div style={{
                width: `${GAME_AREA_WIDTH}px`,
                height: `${GAME_AREA_HEIGHT}px`,
                background: 'linear-gradient(to bottom, #001 0%, #000 100%)', // Night Sky Gradient
                position: 'relative',
                border: '2px solid #555',
                overflow: 'hidden'
            }}>
                {/* Static Background Stars */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    backgroundImage: 'radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px), radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 3px)',
                    backgroundSize: '550px 550px, 350px 350px, 250px 250px',
                    backgroundPosition: '0 0, 40px 60px, 130px 270px'
                }} />

                {!gameActive && (
                    <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        zIndex: 10
                    }}>
                        <button onClick={startGame} style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer' }}>
                            Start Game
                        </button>
                    </div>
                )}

                {/* Magician (Female) */}
                {gameActive && (
                    <div style={{
                        position: 'absolute',
                        left: magicianX,
                        bottom: 0,
                        width: PLAYER_WIDTH,
                        height: 60, // Taller for the figure
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-end'
                    }}>
                        <svg width="60" height="80" viewBox="0 0 60 80">
                            {/* Hat */}
                            <path d="M10 20 L50 20 L40 5 L20 5 Z" fill="#4B0082" />
                            <rect x="5" y="20" width="50" height="5" fill="#4B0082" rx="2" />

                            {/* Face */}
                            <circle cx="30" cy="30" r="8" fill="#FFD1DC" />

                            {/* Hair */}
                            <path d="M22 25 Q30 40 38 25" fill="none" stroke="#333" strokeWidth="2" />

                            {/* Dress/Body */}
                            <path d="M20 38 L40 38 L50 80 L10 80 Z" fill="#800080" />

                            {/* Arms with Wand */}
                            <line x1="20" y1="45" x2="5" y2="35" stroke="#FFD1DC" strokeWidth="3" />
                            <line x1="40" y1="45" x2="55" y2="35" stroke="#FFD1DC" strokeWidth="3" />
                            {/* Wand */}
                            <line x1="55" y1="35" x2="60" y2="25" stroke="#8B4513" strokeWidth="2" />
                            <circle cx="60" cy="25" r="2" fill="yellow" />

                            {/* Basket held in other hand / floating nearby? 
                               Or simplified: basket is separate or implied. 
                               The prompt said "Magician who has a basket". 
                               Let's draw a simple basket next to her or held.
                            */}
                            <path d="M15 50 Q30 70 45 50" fill="#8B4513" opacity="0.8" />
                            <path d="M15 50 Q30 30 45 50" fill="none" stroke="#8B4513" strokeWidth="2" />
                        </svg>
                    </div>
                )}

                {/* Stars */}
                {stars.map(star => (
                    <div key={star.id} style={{
                        position: 'absolute',
                        left: star.x,
                        top: star.y,
                        width: STAR_SIZE,
                        height: STAR_SIZE,
                        backgroundColor: 'gold',
                        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                    }} />
                ))}
            </div>

            {/* Exit Button (Outside Game Area) */}
            <button
                onClick={stopGame}
                style={{
                    marginTop: '20px',
                    padding: '8px 16px',
                    backgroundColor: '#d9534f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Exit Game
            </button>
        </div>
    );
};

export default GameTwo;
