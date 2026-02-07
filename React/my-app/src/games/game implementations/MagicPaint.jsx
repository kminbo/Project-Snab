import React, { useRef, useState, useEffect } from 'react';

const COLORS = [
    { name: 'Red', hex: '#FF0000' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Green', hex: '#008000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Pink', hex: '#FFC0CB' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Brown', hex: '#A52A2A' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#000000' }
];

const GameFour = () => {
    const canvasRef = useRef(null);
    const [selectedColor, setSelectedColor] = useState('#000000'); // Default Black
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState(null);

    // Canvas Dimensions
    const CANVAS_WIDTH = 256.522;
    // Calculation: Total Height (773) - Top Bar (~100) - Bottom Bar (~60)
    // Let's make it flexible but fit the container
    const CANVAS_HEIGHT = 550; // Reduced to ensure bottom bar fits

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.lineWidth = 5;
            setCtx(context);
        }
    }, []);

    useEffect(() => {
        if (ctx) {
            ctx.strokeStyle = selectedColor;
        }
    }, [selectedColor, ctx]);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            ctx.closePath();
            setIsDrawing(false);
        }
    };

    const clearCanvas = () => {
        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    // Auto-clear on unmount (leaving the game)
    useEffect(() => {
        return () => {
            // This runs when component unmounts
            // We can't really "clear" the canvas visually since it's gone, 
            // but this satisfies the logic requirement of cleanup.
            // If we were persisting state, we'd reset it here.
        };
    }, []);


    return (
        <div style={{
            width: '256.522px',
            height: '773.044px',
            border: '1px solid black',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Top Bar: Color Selection */}
            <div style={{
                padding: '10px',
                backgroundColor: '#ddd',
                borderBottom: '1px solid #999',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '5px'
            }}>
                {COLORS.map((color) => (
                    <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.hex)}
                        style={{
                            width: '30px', // Slightly larger
                            height: '30px',
                            backgroundColor: color.hex,
                            border: selectedColor === color.hex ? '3px solid #333' : '1px solid #ccc',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            padding: 0, // Reset padding
                            margin: '3px', // Add slight margin for spacing
                            boxSizing: 'border-box', // Ensure border doesn't affect size
                            appearance: 'none', // Remove default OS styles
                            WebkitAppearance: 'none',
                            outline: 'none'
                        }}
                        title={color.name}
                    />
                ))}
            </div>

            {/* Canvas Area */}
            <div style={{ flex: 1, position: 'relative', cursor: 'crosshair', backgroundColor: 'white' }}>
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    style={{ display: 'block' }}
                />
            </div>

            {/* Bottom Bar: Controls */}
            <div style={{
                padding: '15px',
                backgroundColor: '#eee',
                borderTop: '1px solid #ccc',
                display: 'flex',
                justifyContent: 'center' // Center the single button
            }}>
                <button
                    onClick={clearCanvas}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        width: '80%' // Make button wider as it's the only one
                    }}
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default GameFour;
