'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoCarouselProps {
    images: string[];
}

export default function PhotoCarousel({ images }: PhotoCarouselProps) {
    // Fallback images if none provided
    const displayImages = images.length > 0 ? images : [
        '/vsco/1.png',
        '/vsco/2.png',
        '/vsco/3.png',
        '/vsco/4.png',
        '/vsco/5.png',
        '/vsco/6.png'
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    };

    return (
        <div className="carousel-container" style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Square Container - Fluid */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '280px',
                aspectRatio: '1/1',
                border: '2px solid #333',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#000',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
            }}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentIndex}
                        src={displayImages[currentIndex]}
                        alt={`Snaps ${currentIndex + 1}`}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                        }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            // Visualize error
                            e.currentTarget.parentElement!.style.background = '#222';
                            e.currentTarget.parentElement!.innerHTML = '<div style="color:#666; width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-family:monospace;">IMG NOT FOUND</div>';
                        }}
                    />
                </AnimatePresence>

                {/* Overlay Index */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    pointerEvents: 'none'
                }}>
                    {currentIndex + 1} / {displayImages.length}
                </div>
            </div>

            {/* Navigation Controls */}
            <div style={{
                marginTop: '1rem',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center'
            }}>
                <button
                    onClick={prevImage}
                    className="carousel-btn"
                    style={{
                        background: 'transparent',
                        border: '1px solid #00ff9f',
                        color: '#00ff9f',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    aria-label="Previous image"
                >
                    ←
                </button>
                <button
                    onClick={nextImage}
                    className="carousel-btn"
                    style={{
                        background: 'transparent',
                        border: '1px solid #00ff9f',
                        color: '#00ff9f',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    aria-label="Next image"
                >
                    →
                </button>
            </div>
        </div>
    );
}
