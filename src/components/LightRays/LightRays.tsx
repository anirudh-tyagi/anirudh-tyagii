'use client';

import { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';
import './LightRays.css';

type RaysOrigin = 'top-left' | 'top-center' | 'top-right' | 'left' | 'right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const getAnchorAndDir = (origin: RaysOrigin, w: number, h: number) => {
    const outside = 0.2;
    switch (origin) {
        case 'top-left':
            return { anchor: [0, -outside * h], dir: [0, 1] };
        case 'top-right':
            return { anchor: [w, -outside * h], dir: [0, 1] };
        case 'left':
            return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
        case 'right':
            return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
        case 'bottom-left':
            return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
        case 'bottom-center':
            return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
        case 'bottom-right':
            return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
        default:
            return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
    }
};

interface LightRaysProps {
    raysOrigin?: RaysOrigin;
    raysSpeed?: number;
    lightSpread?: number;
    rayLength?: number;
    fadeDistance?: number;
    intensity?: number;
    followMouse?: boolean;
    mouseInfluence?: number;
    className?: string;
}

const LightRays = ({
    raysOrigin = 'top-center',
    raysSpeed = 1,
    lightSpread = 1,
    rayLength = 2,
    fadeDistance = 1.0,
    intensity = 0.3,
    followMouse = true,
    mouseInfluence = 0.1,
    className = ''
}: LightRaysProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const uniformsRef = useRef<Record<string, { value: unknown }> | null>(null);
    const rendererRef = useRef<Renderer | null>(null);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
    const animationIdRef = useRef<number | null>(null);
    const meshRef = useRef<Mesh | null>(null);
    const cleanupFunctionRef = useRef<(() => void) | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        observerRef.current = new IntersectionObserver(
            entries => {
                const entry = entries[0];
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        observerRef.current.observe(containerRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!isVisible || !containerRef.current) return;

        if (cleanupFunctionRef.current) {
            cleanupFunctionRef.current();
            cleanupFunctionRef.current = null;
        }

        const initializeWebGL = async () => {
            if (!containerRef.current) return;

            await new Promise(resolve => setTimeout(resolve, 10));

            if (!containerRef.current) return;

            const renderer = new Renderer({
                dpr: Math.min(window.devicePixelRatio, 2),
                alpha: true
            });
            rendererRef.current = renderer;

            const gl = renderer.gl;
            gl.canvas.style.width = '100%';
            gl.canvas.style.height = '100%';

            while (containerRef.current.firstChild) {
                containerRef.current.removeChild(containerRef.current.firstChild);
            }
            containerRef.current.appendChild(gl.canvas);

            const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

            const frag = `precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec2 rayPos;
uniform vec2 rayDir;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float fadeDistance;
uniform float intensity;
uniform vec2 mousePos;
uniform float mouseInfluence;

varying vec2 vUv;

// Same multicolor palette as Threads
vec3 getColor(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.33, 0.67);
  return a + b * cos(6.28318 * (c * t + d));
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);
  
  float spreadFactor = pow(max(cosAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  
  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  
  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  float rays1 = rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
  float rays2 = rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);

  float rayVal = rays1 * 0.5 + rays2 * 0.4;
  
  // Apply multicolor based on time - cycling through the palette
  vec3 color = getColor(iTime * 0.1) * rayVal * intensity;
  
  // Add subtle gradient based on position
  float brightness = 1.0 - (coord.y / iResolution.y);
  color *= 0.5 + brightness * 0.5;

  fragColor = vec4(color, rayVal * intensity);
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}`;

            const uniforms: Record<string, { value: unknown }> = {
                iTime: { value: 0 },
                iResolution: { value: [1, 1] },
                rayPos: { value: [0, 0] },
                rayDir: { value: [0, 1] },
                raysSpeed: { value: raysSpeed },
                lightSpread: { value: lightSpread },
                rayLength: { value: rayLength },
                fadeDistance: { value: fadeDistance },
                intensity: { value: intensity },
                mousePos: { value: [0.5, 0.5] },
                mouseInfluence: { value: mouseInfluence }
            };
            uniformsRef.current = uniforms;

            const geometry = new Triangle(gl);
            const program = new Program(gl, {
                vertex: vert,
                fragment: frag,
                uniforms
            });
            const mesh = new Mesh(gl, { geometry, program });
            meshRef.current = mesh;

            const updatePlacement = () => {
                if (!containerRef.current || !renderer) return;

                renderer.dpr = Math.min(window.devicePixelRatio, 2);

                const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
                renderer.setSize(wCSS, hCSS);

                const dpr = renderer.dpr;
                const w = wCSS * dpr;
                const h = hCSS * dpr;

                uniforms.iResolution.value = [w, h];

                const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
                uniforms.rayPos.value = anchor;
                uniforms.rayDir.value = dir;
            };

            const loop = (t: number) => {
                if (!rendererRef.current || !uniformsRef.current || !meshRef.current) {
                    return;
                }

                uniforms.iTime.value = t * 0.001;

                if (followMouse && mouseInfluence > 0.0) {
                    const smoothing = 0.92;

                    smoothMouseRef.current.x = smoothMouseRef.current.x * smoothing + mouseRef.current.x * (1 - smoothing);
                    smoothMouseRef.current.y = smoothMouseRef.current.y * smoothing + mouseRef.current.y * (1 - smoothing);

                    uniforms.mousePos.value = [smoothMouseRef.current.x, smoothMouseRef.current.y];
                }

                try {
                    renderer.render({ scene: mesh });
                    animationIdRef.current = requestAnimationFrame(loop);
                } catch (error) {
                    console.warn('WebGL rendering error:', error);
                    return;
                }
            };

            window.addEventListener('resize', updatePlacement);
            updatePlacement();
            animationIdRef.current = requestAnimationFrame(loop);

            cleanupFunctionRef.current = () => {
                if (animationIdRef.current) {
                    cancelAnimationFrame(animationIdRef.current);
                    animationIdRef.current = null;
                }

                window.removeEventListener('resize', updatePlacement);

                if (renderer) {
                    try {
                        const canvas = renderer.gl.canvas;
                        const loseContextExt = renderer.gl.getExtension('WEBGL_lose_context');
                        if (loseContextExt) {
                            loseContextExt.loseContext();
                        }

                        if (canvas && canvas.parentNode) {
                            canvas.parentNode.removeChild(canvas);
                        }
                    } catch (error) {
                        console.warn('Error during WebGL cleanup:', error);
                    }
                }

                rendererRef.current = null;
                uniformsRef.current = null;
                meshRef.current = null;
            };
        };

        initializeWebGL();

        return () => {
            if (cleanupFunctionRef.current) {
                cleanupFunctionRef.current();
                cleanupFunctionRef.current = null;
            }
        };
    }, [
        isVisible,
        raysOrigin,
        raysSpeed,
        lightSpread,
        rayLength,
        fadeDistance,
        intensity,
        followMouse,
        mouseInfluence
    ]);

    useEffect(() => {
        if (!uniformsRef.current || !containerRef.current || !rendererRef.current) return;

        const u = uniformsRef.current;
        const renderer = rendererRef.current;

        u.raysSpeed.value = raysSpeed;
        u.lightSpread.value = lightSpread;
        u.rayLength.value = rayLength;
        u.fadeDistance.value = fadeDistance;
        u.intensity.value = intensity;
        u.mouseInfluence.value = mouseInfluence;

        const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
        const dpr = renderer.dpr;
        const { anchor, dir } = getAnchorAndDir(raysOrigin, wCSS * dpr, hCSS * dpr);
        u.rayPos.value = anchor;
        u.rayDir.value = dir;
    }, [
        raysSpeed,
        lightSpread,
        raysOrigin,
        rayLength,
        fadeDistance,
        intensity,
        mouseInfluence
    ]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current || !rendererRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            mouseRef.current = { x, y };
        };

        if (followMouse) {
            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }
    }, [followMouse]);

    return <div ref={containerRef} className={`light-rays-container ${className}`.trim()} />;
};

export default LightRays;
