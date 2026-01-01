'use client';

import React, { useEffect, useRef, useState } from 'react';
import './StarWarsTerminal.css';

interface Star {
    x: number;
    y: number;
    z: number;
    sz: number;
}

interface Enemy {
    x: number;
    y: number;
    z: number;
    id: number;
    active: boolean;
}

interface Laser {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    z: number;
    active: boolean;
}

interface Explosion {
    x: number;
    y: number;
    size: number;
    age: number;
    active: boolean;
}



export default function StarWarsTerminal() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    // Load High Score on Mount
    useEffect(() => {
        // Changed key to force reset from previous high scores
        const saved = localStorage.getItem('sw-high-score-init');
        let currentHigh = saved ? parseInt(saved, 10) : 842;

        // Ensure it's saved immediately if it was null
        if (!saved) {
            localStorage.setItem('sw-high-score-init', '842');
        }

        setHighScore(currentHigh);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const centerX = width / 2;
        const centerY = height / 2;

        // Game State
        const stars: Star[] = [];
        let enemies: Enemy[] = [];
        const lasers: Laser[] = [];
        const explosions: Explosion[] = [];
        let enemyIdCounter = 0;

        // Mouse interaction
        let mouseX = centerX;
        let mouseY = centerY;

        // Init Stars
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: (Math.random() - 0.5) * width * 2,
                y: (Math.random() - 0.5) * height * 2,
                z: Math.random() * 2000,
                sz: 0,
            });
        }



        const spawnEnemy = () => {
            // Cleanup inactive enemies first
            enemies = enemies.filter(e => e.active);

            if (enemies.length < 5) {
                enemies.push({
                    x: (Math.random() - 0.5) * width * 3,
                    y: (Math.random() - 0.5) * height * 3,
                    z: 2500, // Start further back
                    id: enemyIdCounter++,
                    active: true,
                });
            }
        };

        // Render Logic
        const draw = () => {
            // Clear screen with trail effect for retro feel? No, standard clear.
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);

            // --- 1. Draw Stars ---
            ctx.fillStyle = '#ffffff';
            stars.forEach((star) => {
                star.z -= 5;
                if (star.z <= 0) {
                    star.z = 2000;
                    star.x = (Math.random() - 0.5) * width * 2;
                    star.y = (Math.random() - 0.5) * height * 2;
                }

                const k = 128.0 / star.z;
                const px = star.x * k + centerX;
                const py = star.y * k + centerY;

                if (px >= 0 && px <= width && py >= 0 && py <= height) {
                    const size = (1 - star.z / 2000) * 2;
                    ctx.beginPath();
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // --- 2. Draw Enemies (TIE Fighters) ---
            enemies.forEach((enemy) => {
                if (!enemy.active) return;
                enemy.z -= 8; // Faster speed

                if (enemy.z <= 10) {
                    // Passed player, respawn
                    enemy.active = false;
                    setTimeout(spawnEnemy, 500); // Trigger new spawn
                    return;
                }

                const k = 500.0 / enemy.z;
                const px = enemy.x * k + centerX;
                const py = enemy.y * k + centerY;
                const size = k * 40;

                // Retro TIE Fighter
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2; // Thicker lines

                // Center Hub
                ctx.beginPath();
                ctx.arc(px, py, size * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = '#000';
                ctx.fill();
                ctx.stroke();
                // Cross on hub
                ctx.beginPath();
                ctx.moveTo(px - size * 0.15, py - size * 0.15);
                ctx.lineTo(px + size * 0.15, py + size * 0.15);
                ctx.moveTo(px + size * 0.15, py - size * 0.15);
                ctx.lineTo(px - size * 0.15, py + size * 0.15);
                ctx.stroke();


                // Wings (Hexagonal vertical panels)
                const wHeight = size;
                const wWidth = size * 0.1;

                // Left Wing
                const lx = px - size * 0.6;
                ctx.beginPath();
                ctx.moveTo(lx, py - wHeight);
                ctx.lineTo(lx - wWidth, py); // Point out
                ctx.lineTo(lx, py + wHeight);
                ctx.lineTo(lx + wWidth, py); // Point in
                ctx.closePath();
                ctx.stroke();
                // Struct
                ctx.beginPath();
                ctx.moveTo(lx, py);
                ctx.lineTo(px - size * 0.3, py);
                ctx.stroke();


                // Right Wing
                const rx = px + size * 0.6;
                ctx.beginPath();
                ctx.moveTo(rx, py - wHeight);
                ctx.lineTo(rx - wWidth, py);
                ctx.lineTo(rx, py + wHeight);
                ctx.lineTo(rx + wWidth, py);
                ctx.closePath();
                ctx.stroke();
                // Struct
                ctx.beginPath();
                ctx.moveTo(rx, py);
                ctx.lineTo(px + size * 0.3, py);
                ctx.stroke();
            });

            // --- 3. Draw Lasers ---
            ctx.strokeStyle = '#ff3333'; // Brighter red
            ctx.lineWidth = 3;
            lasers.forEach((laser) => {
                if (!laser.active) return;
                laser.z += 60; // Very fast

                const progress = laser.z / 1500;
                if (progress > 1.2) {
                    laser.active = false;
                    return;
                }

                const startX = laser.x;
                const startY = laser.y;

                const curX = startX + (laser.targetX - startX) * progress;
                const curY = startY + (laser.targetY - startY) * progress;

                const tailX = startX + (laser.targetX - startX) * (progress - 0.08);
                const tailY = startY + (laser.targetY - startY) * (progress - 0.08);

                if (progress > 0.1) {
                    ctx.beginPath();
                    ctx.moveTo(tailX, tailY);
                    ctx.lineTo(curX, curY);
                    ctx.stroke();
                }

                // Collision
                enemies.forEach(enemy => {
                    if (enemy.active && enemy.z > 500 && enemy.z < 2500) {
                        const k = 500.0 / enemy.z;
                        const ex = enemy.x * k + centerX;
                        const ey = enemy.y * k + centerY;
                        const eRadius = k * 50;

                        const dist = Math.hypot(curX - ex, curY - ey);
                        if (dist < eRadius) {
                            enemy.active = false;
                            laser.active = false;

                            // Update Score with functional update to get latest state
                            setScore(currentScore => {
                                const newScore = currentScore + 1;
                                // Check High Score
                                setHighScore(currentHigh => {
                                    if (newScore > currentHigh) {
                                        localStorage.setItem('sw-high-score-init', newScore.toString());
                                        return newScore;
                                    }
                                    return currentHigh;
                                });
                                return newScore;
                            });

                            explosions.push({
                                x: ex,
                                y: ey,
                                size: 10,
                                age: 0,
                                active: true
                            });

                            setTimeout(() => spawnEnemy(), 800);
                        }
                    }
                });
            });

            // --- 4. Draw Explosions ---
            explosions.forEach(exp => {
                if (!exp.active) return;
                exp.age++;
                if (exp.age > 30) exp.active = false;

                // Retro pixel explosion
                const particles = 8;
                const radius = exp.size + exp.age * 3;

                ctx.fillStyle = exp.age % 4 < 2 ? '#ffff00' : '#ff0000'; // Flash
                for (let i = 0; i < particles; i++) {
                    const angle = (Math.PI * 2 / particles) * i;
                    const px = exp.x + Math.cos(angle) * radius;
                    const py = exp.y + Math.sin(angle) * radius;
                    ctx.fillRect(px - 2, py - 2, 4, 4);
                }
            });

            // --- 5. Draw HUD ---
            // Crosshair
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.beginPath();

            // Scope
            ctx.arc(mouseX, mouseY, 40, 0, Math.PI * 2);
            ctx.moveTo(mouseX - 50, mouseY); ctx.lineTo(mouseX - 20, mouseY);
            ctx.moveTo(mouseX + 50, mouseY); ctx.lineTo(mouseX + 20, mouseY);
            ctx.moveTo(mouseX, mouseY - 50); ctx.lineTo(mouseX, mouseY - 20);
            ctx.moveTo(mouseX, mouseY + 50); ctx.lineTo(mouseX, mouseY + 20);
            ctx.stroke();

            // Scanlines (Simulated with simple lines)
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let y = 0; y < height; y += 4) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();

            requestAnimationFrame(draw);
        };

        const animId = requestAnimationFrame(draw);

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', handleResize);

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const handleClick = (e: MouseEvent) => {
            lasers.push({
                x: 0, y: height,
                targetX: mouseX, targetY: mouseY,
                z: 0, active: true
            });
            lasers.push({
                x: width, y: height,
                targetX: mouseX, targetY: mouseY,
                z: 0, active: true
            });
        };
        window.addEventListener('click', handleClick);

        // Initial spawns - Space them out
        spawnEnemy();
        setTimeout(spawnEnemy, 1000);
        setTimeout(spawnEnemy, 2000);
        setTimeout(spawnEnemy, 3000);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('click', handleClick);
        };
    }, []);

    return (
        <div className="star-wars-terminal">
            <div className="crt-overlay"></div>
            <div style={{
                position: 'absolute',
                top: 20,
                right: 20,
                color: '#00ff00',
                fontFamily: '"VT323", monospace',
                fontSize: '24px',
                zIndex: 10,
                textShadow: '0 0 5px #00ff00',
                textAlign: 'right'
            }}>
                <div>SCORE: {score.toString().padStart(6, '0')}</div>
                <div style={{ fontSize: '18px', color: '#00cc00', marginTop: '0px' }}>
                    HIGHEST SCORE: {highScore.toString().padStart(6, '0')}
                </div>
            </div>
            <canvas ref={canvasRef} />
        </div>
    );
}
