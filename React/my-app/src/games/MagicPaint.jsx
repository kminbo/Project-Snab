import React, { useRef, useState, useEffect } from 'react';
import { generateHealingArtwork } from '../gemini/geminiImageGen.js';

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
    const scrollContainerRef = useRef(null);
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [healingText, setHealingText] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;

        if (canvas && container) {
            canvas.width = container.offsetWidth;
            canvas.height = 250;

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

    const isCanvasBlank = () => {
        const canvas = canvasRef.current;
        if (!canvas) return true;
        const context = canvas.getContext('2d');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] !== 0) return false;
        }
        return true;
    };

    const handleHealDrawing = async () => {
        setError('');

        if (isCanvasBlank()) {
            setError('Please draw something first!');
            return;
        }

        setIsGenerating(true);
        setGeneratedImage(null);
        setHealingText('');

        try {
            const canvas = canvasRef.current;
            const dataUrl = canvas.toDataURL('image/png');
            const base64Data = dataUrl.split(',')[1];

            const result = await generateHealingArtwork(base64Data);

            if (result.imageData) {
                setGeneratedImage(
                    `data:${result.imageData.mimeType};base64,${result.imageData.data}`
                );
            }
            if (result.text) {
                setHealingText(result.text);
            }

            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                        top: scrollContainerRef.current.scrollHeight,
                        behavior: 'smooth',
                    });
                }
            }, 100);
        } catch (err) {
            setError('Failed to generate artwork. Please try again.');
            console.error('Heal drawing error:', err);
        } finally {
            setIsGenerating(false);
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
                gap: '5px',
                flexShrink: 0,
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

            {/* Scrollable content area */}
            <div
                ref={scrollContainerRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Canvas Area */}
                <div style={{
                    position: 'relative',
                    cursor: 'crosshair',
                    backgroundColor: 'white',
                    height: '250px',
                    flexShrink: 0,
                }}>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        style={{ display: 'block', width: '100%', height: '100%' }}
                    />
                </div>

                {/* Button Bar */}
                <div style={{
                    padding: '10px',
                    backgroundColor: '#eee',
                    borderTop: '1px solid #ccc',
                    display: 'flex',
                    gap: '8px',
                    flexShrink: 0,
                }}>
                    <button
                        onClick={clearCanvas}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            backgroundColor: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                        }}
                    >
                        Clear
                    </button>
                    <button
                        onClick={handleHealDrawing}
                        disabled={isGenerating}
                        style={{
                            flex: 2,
                            padding: '8px 12px',
                            background: isGenerating
                                ? '#999'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isGenerating ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            opacity: isGenerating ? 0.7 : 1,
                        }}
                    >
                        Heal My Art
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div style={{
                        padding: '8px 12px',
                        margin: '8px 10px 0',
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                    }}>
                        {error}
                    </div>
                )}

                {/* Loading spinner */}
                {isGenerating && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '20px',
                        gap: '10px',
                    }}>
                        <div style={{
                            width: '30px',
                            height: '30px',
                            border: '3px solid #ddd',
                            borderTopColor: '#764ba2',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                        }} />
                        <span style={{ color: '#666', fontSize: '0.85rem' }}>
                            Transforming your drawing...
                        </span>
                    </div>
                )}

                {/* Generated artwork display */}
                {generatedImage && (
                    <div style={{
                        padding: '12px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                    }}>
                        <span style={{
                            fontWeight: 'bold',
                            color: '#764ba2',
                            fontSize: '0.95rem',
                        }}>
                            Your Healing Artwork
                        </span>
                        <img
                            src={generatedImage}
                            alt="AI-generated healing artwork"
                            style={{
                                maxWidth: '100%',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                            }}
                        />
                        {healingText && (
                            <p style={{
                                margin: 0,
                                color: '#555',
                                fontSize: '0.85rem',
                                textAlign: 'center',
                                fontStyle: 'italic',
                                padding: '0 8px',
                            }}>
                                {healingText}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MagicPaint;
