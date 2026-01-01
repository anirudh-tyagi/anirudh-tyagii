'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import '@/app/terminal.css';

interface CardStackProps {
    images: string[];
}

export default function CardStack({ images }: CardStackProps) {
    // If no images, show placeholders
    const displayImages = images.length > 0 ? images : [
        '/vsco/1.jpg',
        '/vsco/2.jpg',
        '/vsco/3.jpg'
    ];

    // For a simple stack, we can just render them with different rotations
    // and let the user drag top ones. 
    // But to keep it simple and robust:
    // We render the last image at the bottom, first at top.

    // Actually, a nice "fanning" stack is better. 
    // Let's make the top card draggable.

    return (
        <div className="stack-container" style={{ minHeight: '300px' }}>
            {displayImages.map((src, index) => (
                <Card
                    key={index}
                    src={src}
                    index={index}
                    total={displayImages.length}
                />
            ))}
        </div>
    );
}

function Card({ src, index, total }: { src: string, index: number, total: number }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-100, 100], [-15, 15]);

    // Reverse index for z-index (0 is bottom, last is top)
    // Wait, usually map index 0 is rendered first (bottom-most in DOM order without z-index).
    // So index 0 is "behind" index 1.
    // We want the last element in the array to be on TOP if we just map.
    // Unless we control z-index.

    // Let's randomize rotation slightly for the 'messy stack' look
    const randomRotate = (index % 2 === 0 ? 1 : -1) * (index * 2);

    return (
        <motion.div
            className="card-rotate"
            style={{
                x,
                y,
                rotate: rotate,
                zIndex: index,
                cursor: 'grab',
                // Remove centering transform here to avoid conflict with CSS or Framer
                // We rely on CSS absolute positioning with margin/translate
            }}
            drag
            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
            dragElastic={0.1}
            whileTap={{ cursor: 'grabbing', scale: 1.05 }}
            initial={{
                rotate: randomRotate,
                scale: 1 - (total - index) * 0.05, // Stack effect: lower cards smaller
                x: 0,
                y: 0
            }}
        >
            <div className="card">
                {/* We use a colored placeholder if image fails or isn't there yet */}
                <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Try to load image, fallback to text */}
                    <img
                        src={src}
                        className="card-image"
                        alt=""
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = `<span style='color:#555; font-family:monospace'>IMG ${index + 1}</span>`;
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
