import React, { useState, useEffect, useRef, useCallback } from 'react';

const EggFly = () => {
    const containerRef = useRef(null);
    const [dragonPos, setDragonPos] = useState({ x: 200, y: 200 });
    const [targetPos, setTargetPos] = useState({ x: 200, y: 200 });
    const [eggs, setEggs] = useState([]);
    const [caughtAnimation, setCaughtAnimation] = useState([]);
    const [eggCount, setEggCount] = useState(0);
    const [target, setTarget] = useState(5);
    const [targetIncrement, setTargetIncrement] = useState(5);
    const [showTargetMessage, setShowTargetMessage] = useState(false);
    const animationRef = useRef(null);
    const eggIdRef = useRef(0);

    // Spawn eggs randomly
    useEffect(() => {
        const spawnEgg = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const padding = 60;
            const newEgg = {
                id: eggIdRef.current++,
                x: padding + Math.random() * (rect.width - padding * 2),
                y: padding + Math.random() * (rect.height - padding * 2),
                scale: 0,
                opacity: 1,
            };
            setEggs(prev => [...prev.slice(-7), newEgg]); // Keep max 8 eggs
        };

        // Initial eggs
        setTimeout(spawnEgg, 500);
        setTimeout(spawnEgg, 1000);
        setTimeout(spawnEgg, 1500);

        const spawnInterval = setInterval(spawnEgg, 2500);
        return () => clearInterval(spawnInterval);
    }, []);

    // Remove eggs after some time (they fade away gently)
    useEffect(() => {
        const fadeInterval = setInterval(() => {
            setEggs(prev => {
                if (prev.length > 4) {
                    // Randomly remove one older egg
                    const removeIndex = Math.floor(Math.random() * Math.min(3, prev.length));
                    return prev.filter((_, i) => i !== removeIndex);
                }
                return prev;
            });
        }, 4000);
        return () => clearInterval(fadeInterval);
    }, []);

    // Track mouse position
    const handleMouseMove = useCallback((e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setTargetPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }, []);

    // Smooth dragon movement with lerp
    useEffect(() => {
        const lerp = (start, end, factor) => start + (end - start) * factor;

        const animate = () => {
            setDragonPos(prev => ({
                x: lerp(prev.x, targetPos.x, 0.08),
                y: lerp(prev.y, targetPos.y, 0.08)
            }));
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [targetPos]);

    // Check for egg catching
    useEffect(() => {
        const catchRadius = 45;
        setEggs(prev => {
            const remaining = [];
            const caught = [];

            prev.forEach(egg => {
                const dx = dragonPos.x - egg.x;
                const dy = dragonPos.y - egg.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < catchRadius) {
                    caught.push(egg);
                } else {
                    remaining.push(egg);
                }
            });

            if (caught.length > 0) {
                setCaughtAnimation(prev => [...prev, ...caught.map(e => ({ ...e, time: Date.now() }))]);
                setEggCount(prev => prev + caught.length);
                setTimeout(() => {
                    setCaughtAnimation(prev => prev.filter(a => Date.now() - a.time < 600));
                }, 700);
            }

            return remaining;
        });
    }, [dragonPos]);

    // Check if target is reached
    useEffect(() => {
        if (eggCount >= target) {
            setShowTargetMessage(true);
            setTarget(prev => prev + targetIncrement);
            setTargetIncrement(prev => prev + 5);
            setTimeout(() => {
                setShowTargetMessage(false);
            }, 2000);
        }
    }, [eggCount, target, targetIncrement]);

    // Calculate dragon rotation based on movement direction
    const [rotation, setRotation] = useState(0);
    const prevPosRef = useRef(dragonPos);

    useEffect(() => {
        const dx = dragonPos.x - prevPosRef.current.x;
        const dy = dragonPos.y - prevPosRef.current.y;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            setRotation(angle);
        }
        prevPosRef.current = dragonPos;
    }, [dragonPos]);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'none',
                borderRadius: '12px',
            }}
        >
            {/* Soft ambient particles */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 20% 80%, rgba(255,200,100,0.05) 0%, transparent 50%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 80% 20%, rgba(100,150,255,0.05) 0%, transparent 50%)',
                pointerEvents: 'none',
            }} />

            {/* Counter and Target Display */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                color: 'rgba(255,255,255,0.9)',
                fontSize: '18px',
                fontFamily: 'system-ui, sans-serif',
                fontWeight: 'bold',
                pointerEvents: 'none',
                background: 'rgba(0,0,0,0.3)',
                padding: '10px 15px',
                borderRadius: '8px',
                backdropFilter: 'blur(5px)',
            }}>
                🥚 {eggCount} / {target}
            </div>

            {/* Achievement Message */}
            {showTargetMessage && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#fff',
                    fontSize: '24px',
                    fontFamily: 'system-ui, sans-serif',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    background: 'rgba(100,200,100,0.9)',
                    padding: '20px 40px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                    animation: 'targetAchieved 2s ease-out',
                    zIndex: 100,
                }}>
                    ✨ Target Achieved! ✨<br />
                    <span style={{ fontSize: '18px' }}>New target unlocked: {target}</span>
                </div>
            )}

            {/* Eggs */}
            {eggs.map(egg => (
                <div
                    key={egg.id}
                    style={{
                        position: 'absolute',
                        left: egg.x,
                        top: egg.y,
                        transform: 'translate(-50%, -50%)',
                        fontSize: '32px',
                        transition: 'opacity 0.5s ease-out',
                        animation: 'eggFloat 3s ease-in-out infinite',
                        filter: 'drop-shadow(0 0 10px rgba(255,200,100,0.4))',
                    }}
                >
                    🥚
                </div>
            ))}

            {/* Caught animations */}
            {caughtAnimation.map(egg => (
                <div
                    key={`caught-${egg.id}`}
                    style={{
                        position: 'absolute',
                        left: egg.x,
                        top: egg.y,
                        transform: 'translate(-50%, -50%)',
                        fontSize: '24px',
                        animation: 'catchPop 0.6s ease-out forwards',
                        pointerEvents: 'none',
                    }}
                >
                    ✨
                </div>
            ))}

            {/* Dragon */}
            <div
                style={{
                    position: 'absolute',
                    left: dragonPos.x,
                    top: dragonPos.y,
                    transform: `translate(-50%, -50%) scaleX(${rotation > 90 || rotation < -90 ? -1 : 1})`,
                    fontSize: '48px',
                    transition: 'transform 0.1s ease-out',
                    filter: 'drop-shadow(0 0 15px rgba(100,200,255,0.5))',
                    zIndex: 10,
                }}
            >
                🐉
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes eggFloat {
                    0%, 100% { transform: translate(-50%, -50%) translateY(0); }
                    50% { transform: translate(-50%, -50%) translateY(-8px); }
                }
                @keyframes catchPop {
                    0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.5); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) translateY(-20px); }
                }
                @keyframes targetAchieved {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    10% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                    20% { transform: translate(-50%, -50%) scale(1); }
                    90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                }
            `}</style>
        </div>
    );
};

export default EggFly;
