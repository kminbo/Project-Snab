import React, { useState, useEffect, useRef } from 'react';

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const STAR_SIZE = 35;
const PLAYER_SPEED = 5;
const STAR_SPEED = 1.5;
const SPAWN_RATE = 0.02;

const StarCatcher = () => {
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 600 });
    const [score, setScore] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [magicianX, setMagicianX] = useState(0);
    const [stars, setStars] = useState([]);

    const requestRef = useRef();
    const keysPressed = useRef({});
    const magicianXRef = useRef(0);

    // Calculate container size
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                const height = containerRef.current.offsetHeight - 100; // Reserve space for UI
                setContainerSize({ width, height: Math.min(height, 600) });
                setMagicianX(width / 2 - PLAYER_WIDTH / 2);
                magicianXRef.current = width / 2 - PLAYER_WIDTH / 2;
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

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

    // Update ref when state changes
    useEffect(() => {
        magicianXRef.current = magicianX;
    }, [magicianX]);

    // Game Loop
    useEffect(() => {
        if (!gameActive) return;

        const loop = () => {
            // Player Logic
            let currentX = magicianXRef.current;
            if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
                currentX -= PLAYER_SPEED;
            }
            if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
                currentX += PLAYER_SPEED;
            }
            currentX = Math.max(0, Math.min(containerSize.width - PLAYER_WIDTH, currentX));

            setMagicianX(currentX);

            setStars(prevStars => {
                const nextStars = [];
                prevStars.forEach(star => {
                    const nextY = star.y + STAR_SPEED;
                    const playerY = containerSize.height - PLAYER_HEIGHT;

                    const collision = (
                        star.x < currentX + PLAYER_WIDTH &&
                        star.x + STAR_SIZE > currentX &&
                        nextY < playerY + PLAYER_HEIGHT &&
                        nextY + STAR_SIZE > playerY
                    );

                    if (collision) {
                        setScore(s => s + 1);
                    } else if (nextY < containerSize.height) {
                        nextStars.push({ ...star, y: nextY });
                    }
                });

                if (Math.random() < SPAWN_RATE) {
                    nextStars.push({
                        id: Date.now() + Math.random(),
                        x: Math.random() * (containerSize.width - STAR_SIZE),
                        y: 0
                    });
                }
                return nextStars;
            });

            requestRef.current = requestAnimationFrame(loop);
        };
        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameActive, containerSize]);

    const startGame = () => {
        setScore(0);
        setStars([]);
        setMagicianX(containerSize.width / 2 - PLAYER_WIDTH / 2);
        setGameActive(true);
    };

    const stopGame = () => {
        setGameActive(false);
        setStars([]);
    };

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#222',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                color: 'white',
                borderRadius: '12px'
            }}
        >
            {/* Score */}
            <div style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold' }}>
                Score: {score}
            </div>

            {/* Game Area */}
            <div style={{
                width: '100%',
                height: `${containerSize.height}px`,
                background: 'linear-gradient(to bottom, #001 0%, #000 100%)',
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

                {/* Magician */}
                {gameActive && (
                    <div style={{
                        position: 'absolute',
                        left: magicianX,
                        bottom: 0,
                        width: PLAYER_WIDTH,
                        height: 60,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-end'
                    }}>
                        <svg width="60" height="80" viewBox="0 0 60 80">
                            <path d="M10 20 L50 20 L40 5 L20 5 Z" fill="#4B0082" />
                            <rect x="5" y="20" width="50" height="5" fill="#4B0082" rx="2" />
                            <circle cx="30" cy="30" r="8" fill="#FFD1DC" />
                            <path d="M22 25 Q30 40 38 25" fill="none" stroke="#333" strokeWidth="2" />
                            <path d="M20 38 L40 38 L50 80 L10 80 Z" fill="#800080" />
                            <line x1="20" y1="45" x2="5" y2="35" stroke="#FFD1DC" strokeWidth="3" />
                            <line x1="40" y1="45" x2="55" y2="35" stroke="#FFD1DC" strokeWidth="3" />
                            <line x1="55" y1="35" x2="60" y2="25" stroke="#8B4513" strokeWidth="2" />
                            <circle cx="60" cy="25" r="2" fill="yellow" />
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

            {/* Exit Button */}
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

export default StarCatcher;
