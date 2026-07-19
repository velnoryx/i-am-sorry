'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  type?: 'circle' | 'emoji' | 'star';
  emoji?: string;
}

interface ButterflyParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  driftX: number;
  flyY: number;
  startRot: number;
  rotDiff: number;
  duration: number;
  flapDuration: number;
  spawnTime: number;
  curveDir: number;
}

function CursorGlow() {
  const [isHoverDevice, setIsHoverDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover)').matches;
  });
  const [isHovered, setIsHovered] = useState(false);
  const [butterflies, setButterflies] = useState<ButterflyParticle[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const isHoveredRef = useRef(false);

  const smoothMouseRef = useRef({ x: -100, y: -100 });
  const lastSpawnRef = useRef({ x: -100, y: -100 });
  const butterfliesRef = useRef<ButterflyParticle[]>([]);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { stiffness: 280, damping: 26, mass: 0.3 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  const drawStar4 = (c: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    c.beginPath();
    c.moveTo(x, y - r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.quadraticCurveTo(x, y, x, y + r);
    c.quadraticCurveTo(x, y, x - r, y);
    c.quadraticCurveTo(x, y, x, y - r);
    c.closePath();
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover)');
    const handleChange = (e: MediaQueryListEvent) => setIsHoverDevice(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Canvas particle system loop
  useEffect(() => {
    if (!isHoverDevice) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Event listener for heart-burst effect
    const handleHeartBurst = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number }>;
      const { x, y } = customEvent.detail;
      const particles = particlesRef.current;
      const heartEmojis = ['💖', '💕', '💗', '❤️', '🌸', '💜', '💝'];

      // Burst out 22 heart emoji particles!
      for (let i = 0; i < 22; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 6.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.8, // subtle upwards velocity bias
          size: 14 + Math.random() * 16,
          alpha: 1.0,
          color: '',
          type: 'emoji',
          emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
        });
      }

      // Also burst 12 small gold sparkles
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.0 + Math.random() * 4.0;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.0 + Math.random() * 2.5,
          alpha: 0.95,
          color: 'rgba(253, 224, 71, ', // gold
          type: 'star',
        });
      }
    };

    window.addEventListener('heart-burst', handleHeartBurst);

    const updateAndDrawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      // --- Premium Butterfly Spawning Trail (with inertia) ---
      if (mouseRef.current.x > 0) {
        if (smoothMouseRef.current.x === -100) {
          smoothMouseRef.current = { x: mouseRef.current.x, y: mouseRef.current.y };
          lastSpawnRef.current = { x: mouseRef.current.x, y: mouseRef.current.y };
        } else {
          const inertia = 0.15; // Makes butterflies lag slightly behind the cursor
          smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * inertia;
          smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * inertia;
        }

        const spawnDx = smoothMouseRef.current.x - lastSpawnRef.current.x;
        const spawnDy = smoothMouseRef.current.y - lastSpawnRef.current.y;
        const dist = Math.sqrt(spawnDx * spawnDx + spawnDy * spawnDy);

        // Spawn 1-2 butterflies every 15px of movement
        if (dist > 15) {
          const currentCount = butterfliesRef.current.length;
          if (currentCount < 15) { // Maximum 15 butterflies at once
            const numToSpawn = Math.min(Math.random() > 0.6 ? 2 : 1, 15 - currentCount);
            const newButterflies = [...butterfliesRef.current];

            for (let i = 0; i < numToSpawn; i++) {
              const id = Math.random().toString(36).substring(2, 9);
              const size = 12 + Math.random() * 6; // Small size (12-18px)
              
              // Colors: Champagne Gold #E8C98B, Pearl White #FFF8F0, Soft Blush #F7D6E5
              const luxuryColors = ['#E8C98B', '#FFF8F0', '#F7D6E5'];
              const color = luxuryColors[Math.floor(Math.random() * luxuryColors.length)];
              
              const driftX = (Math.random() - 0.5) * 50; // Soft curve: drift left/right
              const flyY = -70 - Math.random() * 50; // Gently fly upwards
              
              const startRot = (Math.random() - 0.5) * 10; // Slight starting angle
              const rotDiff = Math.random() > 0.5 ? 15 : -15; // Slowly rotate by exactly 15 degrees over lifespan
              
              const duration = 2.0 + Math.random() * 1.0; // Fade out over 2-3 seconds
              const flapDuration = 0.125 + Math.random() * 0.041; // Flap speed: 6-8 times per second (0.125s - 0.166s)

              const offsetX = (Math.random() - 0.5) * 8;
              const offsetY = (Math.random() - 0.5) * 8;
              const curveDir = Math.random() > 0.5 ? 1 : -1; // Slight left/right random curve direction

              newButterflies.push({
                id,
                x: smoothMouseRef.current.x + offsetX,
                y: smoothMouseRef.current.y + offsetY,
                size,
                color,
                driftX,
                flyY,
                startRot,
                rotDiff,
                duration,
                flapDuration,
                spawnTime: Date.now(),
                curveDir,
              });
            }

            butterfliesRef.current = newButterflies;
            setButterflies(newButterflies);
          }
          lastSpawnRef.current = { x: smoothMouseRef.current.x, y: smoothMouseRef.current.y };
        }
      }

      // --- Clean up expired butterflies ---
      const now = Date.now();
      let hasExpired = false;
      const activeButterflies = butterfliesRef.current.filter((bf) => {
        const age = (now - bf.spawnTime) / 1000;
        if (age >= bf.duration) {
          hasExpired = true;
          return false;
        }
        return true;
      });

      if (hasExpired) {
        butterfliesRef.current = activeButterflies;
        setButterflies(activeButterflies);
      }

      ctx.save();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        
        // Decelerate slightly
        p.vx *= 0.98;
        p.vy *= 0.98;

        if (p.type === 'emoji') {
          p.alpha -= 0.016; // emoji bursts last slightly longer
          p.size *= 0.97;
        } else {
          p.alpha -= 0.024;
          p.size *= 0.95;
        }

        if (p.alpha <= 0 || p.size < 0.3) {
          particles.splice(i, 1);
          continue;
        }

        if (p.type === 'emoji') {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.font = `${p.size}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji || '💖', p.x, p.y);
          ctx.restore();
        } else if (p.type === 'star') {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = `${p.color}${p.alpha})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#ffffff';
          drawStar4(ctx, p.x, p.y, p.size * 2.0);
          ctx.fill();
          ctx.restore();
        } else {
          // Default circle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(244, 63, 94, 0.3)';
          ctx.fill();
        }
      }
      ctx.restore();

      animationId = requestAnimationFrame(updateAndDrawParticles);
    };

    animationId = requestAnimationFrame(updateAndDrawParticles);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('heart-burst', handleHeartBurst);
      cancelAnimationFrame(animationId);
    };
  }, [isHoverDevice]);

  const lastTargetRef = useRef<HTMLElement | null>(null);
  const activeInteractiveRef = useRef<{ element: HTMLElement; rect: DOMRect } | null>(null);

  // Mouse move and magnetic / hover listener
  useEffect(() => {
    if (!isHoverDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      const target = e.target as HTMLElement;
      if (target !== lastTargetRef.current) {
        lastTargetRef.current = target;
        const interactive = target.closest('button, a, input, textarea, [role="button"], .interactive-glow, .magnetic-target') as HTMLElement | null;
        if (interactive) {
          activeInteractiveRef.current = {
            element: interactive,
            rect: interactive.getBoundingClientRect(),
          };
          setIsHovered(true);
          isHoveredRef.current = true;
        } else {
          activeInteractiveRef.current = null;
          setIsHovered(false);
          isHoveredRef.current = false;
        }
      }

      const active = activeInteractiveRef.current;
      if (active) {
        const rect = active.rect;
        
        // Compute center of interactive item
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Pull cursor towards the center (magnetic snap)
        const snapFactor = 0.35; // strength of magnetic pull
        const snappedX = e.clientX + (centerX - e.clientX) * snapFactor;
        const snappedY = e.clientY + (centerY - e.clientY) * snapFactor;

        // Position custom cursor ring
        cursorX.set(snappedX - (isHoveredRef.current ? 25 : 20));
        cursorY.set(snappedY - (isHoveredRef.current ? 25 : 20));
      } else {
        cursorX.set(e.clientX - 20);
        cursorY.set(e.clientY - 20);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHoverDevice, cursorX, cursorY]);

  if (!isHoverDevice) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[99998]"
        style={{ mixBlendMode: 'screen' }}
      />
      <motion.div
        className="fixed pointer-events-none z-[99999] hidden md:block"
        style={{
          x,
          y,
          width: isHovered ? 50 : 40,
          height: isHovered ? 50 : 40,
          borderRadius: '50%',
          background: isHovered
            ? 'radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, rgba(192, 38, 211, 0.05) 60%, transparent 85%)'
            : 'radial-gradient(circle, rgba(244, 63, 94, 0.3) 0%, rgba(192, 38, 211, 0.15) 50%, transparent 80%)',
          boxShadow: isHovered
            ? '0 0 35px rgba(244, 63, 94, 0.55), inset 0 0 10px rgba(255, 255, 255, 0.25)'
            : '0 0 25px rgba(244, 63, 94, 0.25), inset 0 0 6px rgba(255, 255, 255, 0.12)',
          border: isHovered
            ? '1.5px solid rgba(244, 63, 94, 0.5)'
            : '1px solid rgba(255, 255, 255, 0.18)',
        }}
        animate={{
          scale: isHovered ? 1.15 : 1,
        }}
        transition={{
          scale: { type: 'spring', stiffness: 350, damping: 20 },
        }}
      />
      {butterflies.map((bf) => (
        <div
          key={bf.id}
          className="butterfly-particle"
          style={{
            left: bf.x,
            top: bf.y,
            width: bf.size,
            height: bf.size,
            marginLeft: -bf.size / 2,
            marginTop: -bf.size / 2,
            '--bf-drift-x': `${bf.driftX}px`,
            '--bf-fly-y': `${bf.flyY}px`,
            '--bf-start-rot': `${bf.startRot}deg`,
            '--bf-rot-diff': `${bf.rotDiff}deg`,
            '--bf-duration': `${bf.duration}s`,
            '--bf-flap-duration': `${bf.flapDuration}s`,
            '--bf-curve-dir': `${bf.curveDir}`,
            color: bf.color,
          } as React.CSSProperties}
        >
          <div className="butterfly-wings-container">
            {/* Left Wing (flipped) */}
            <div className="butterfly-wing butterfly-wing-left">
              <svg viewBox="0 0 50 100" className="w-full h-full fill-current" style={{ filter: 'drop-shadow(0 0 3px currentColor)' }}>
                <path d="M 0,50 C 0,20 30,0 45,15 C 55,25 45,45 30,50 C 45,55 40,85 25,90 C 15,92 5,80 0,50 Z" />
              </svg>
            </div>
            {/* Right Wing */}
            <div className="butterfly-wing butterfly-wing-right">
              <svg viewBox="0 0 50 100" className="w-full h-full fill-current" style={{ filter: 'drop-shadow(0 0 3px currentColor)' }}>
                <path d="M 0,50 C 0,20 30,0 45,15 C 55,25 45,45 30,50 C 45,55 40,85 25,90 C 15,92 5,80 0,50 Z" />
              </svg>
            </div>
            {/* Center Body Silhouette with head, thorax, abdomen, and antennae */}
            <svg viewBox="0 0 10 100" className="absolute left-1/2 top-[10%] h-[80%] -translate-x-1/2 fill-current opacity-70 pointer-events-none">
              <circle cx="5" cy="15" r="2" />
              <path d="M 5,17 C 6,17 6.8,25 6.5,40 C 6.2,50 5.8,70 5,85 C 4.2,70 3.8,50 3.5,40 C 3.2,25 4,17 5,17 Z" />
              <path d="M 5,13 Q 2,8 1,3 M 5,13 Q 8,8 9,3" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      ))}
    </>
  );
}

export default React.memo(CursorGlow);
