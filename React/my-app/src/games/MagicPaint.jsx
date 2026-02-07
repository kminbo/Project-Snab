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

const MagicPaint = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;

        if (canvas && container) {
            // Set canvas size to match container
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight - 120; // Reserve space for top and bottom bars

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

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: '12px'
            }}
        >
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
                            width: '30px',
                            height: '30px',
                            backgroundColor: color.hex,
                            border: selectedColor === color.hex ? '3px solid #333' : '1px solid #ccc',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            padding: 0,
                            margin: '3px',
                            boxSizing: 'border-box',
                            appearance: 'none',
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
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    style={{ display: 'block', width: '100%', height: '100%' }}
                />
            </div>

            {/* Bottom Bar: Controls */}
            <div style={{
                padding: '15px',
                backgroundColor: '#eee',
                borderTop: '1px solid #ccc',
                display: 'flex',
                justifyContent: 'center'
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
                        width: '80%'
                    }}
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default MagicPaint;
