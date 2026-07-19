'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

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

function CursorGlow() {
  const [mounted, setMounted] = useState(false);
  const [isHoverDevice, setIsHoverDevice] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    
    // Defer state updates to avoid synchronous setState inside useEffect body
    setTimeout(() => {
      if (isCurrent) {
        setMounted(true);
        setIsHoverDevice(window.matchMedia('(hover: hover)').matches);
      }
    }, 0);

    const mediaQuery = window.matchMedia('(hover: hover)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (isCurrent) {
        setIsHoverDevice(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      isCurrent = false;
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  if (!mounted || !isHoverDevice) return null;

  return createPortal(<CursorSystem />, document.body);
}

function CursorSystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const isHoveredRef = useRef(false);
  const lastSpawnRef = useRef({ x: -100, y: -100 });
  const lastTargetRef = useRef<HTMLElement | null>(null);
  const activeInteractiveRef = useRef<{ element: HTMLElement; rect: DOMRect } | null>(null);

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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleHeartBurst = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number }>;
      const { x, y } = customEvent.detail;
      const particles = particlesRef.current;
      const heartEmojis = ['💖', '💕', '💗', '❤️', '🌸', '💜', '💝'];

      // Burst out 22 heart emoji particles
      for (let i = 0; i < 22; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 6.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.8,
          size: 14 + Math.random() * 16,
          alpha: 1.0,
          color: '',
          type: 'emoji',
          emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
        });
      }

      // Burst out 12 small gold sparkles
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
          color: 'rgba(253, 224, 71, ',
          type: 'star',
        });
      }
    };

    window.addEventListener('heart-burst', handleHeartBurst);

    const spawnButterfly = (spawnX: number, spawnY: number) => {
      const container = containerRef.current;
      if (!container) return;

      // Limit concurrent butterflies to prevent overcrowding and lag
      if (container.getElementsByClassName('butterfly-particle').length >= 25) {
        return;
      }

      const size = 12 + Math.random() * 6; // Small size (12-18px)
      const scale = 0.6 + Math.random() * 0.5; // Random scale between 0.6 and 1.1
      const duration = 1.8 + Math.random() * 0.7; // Lifetime: 1.8s to 2.5s
      const flapDuration = 0.125 + Math.random() * 0.041;

      const luxuryColors = ['#E8C98B', '#FFF8F0', '#F7D6E5'];
      const color = luxuryColors[Math.floor(Math.random() * luxuryColors.length)];

      const driftX = (Math.random() - 0.5) * 50; // Gentle horizontal drift
      const flyY = -70 - Math.random() * 50; // Fly upwards
      
      const startRot = -20 + Math.random() * 40; // Small random rotation (-20 to 20)
      const rotDiff = (Math.random() - 0.5) * 30;
      const curveDir = Math.random() > 0.5 ? 1 : -1;

      const bfEl = document.createElement('div');
      bfEl.className = 'butterfly-particle';
      bfEl.style.left = `${spawnX}px`;
      bfEl.style.top = `${spawnY}px`;
      bfEl.style.width = `${size}px`;
      bfEl.style.height = `${size}px`;
      bfEl.style.transform = 'translate(-50%, -50%)';
      bfEl.style.setProperty('--bf-drift-x', `${driftX}px`);
      bfEl.style.setProperty('--bf-fly-y', `${flyY}px`);
      bfEl.style.setProperty('--bf-start-rot', `${startRot}deg`);
      bfEl.style.setProperty('--bf-rot-diff', `${rotDiff}deg`);
      bfEl.style.setProperty('--bf-duration', `${duration}s`);
      bfEl.style.setProperty('--bf-flap-duration', `${flapDuration}s`);
      bfEl.style.setProperty('--bf-curve-dir', `${curveDir}`);
      bfEl.style.setProperty('--bf-start-scale', `${scale}`);
      bfEl.style.color = color;

      bfEl.innerHTML = `
        <div class="butterfly-wings-container">
          <!-- Left Wing -->
          <div class="butterfly-wing butterfly-wing-left">
            <svg viewBox="0 0 50 100" class="w-full h-full fill-current" style="filter: drop-shadow(0 0 3px currentColor)">
              <path d="M 0,50 C 0,20 30,0 45,15 C 55,25 45,45 30,50 C 45,55 40,85 25,90 C 15,92 5,80 0,50 Z" />
            </svg>
          </div>
          <!-- Right Wing -->
          <div class="butterfly-wing butterfly-wing-right">
            <svg viewBox="0 0 50 100" class="w-full h-full fill-current" style="filter: drop-shadow(0 0 3px currentColor)">
              <path d="M 0,50 C 0,20 30,0 45,15 C 55,25 45,45 30,50 C 45,55 40,85 25,90 C 15,92 5,80 0,50 Z" />
            </svg>
          </div>
          <!-- Center Body -->
          <svg viewBox="0 0 10 100" class="absolute left-1/2 top-[10%] h-[80%] -translate-x-1/2 fill-current opacity-70 pointer-events-none">
            <circle cx="5" cy="15" r="2" />
            <path d="M 5,17 C 6,17 6.8,25 6.5,40 C 6.2,50 5.8,70 5,85 C 4.2,70 3.8,50 3.5,40 C 3.2,25 4,17 5,17 Z" />
            <path d="M 5,13 Q 2,8 1,3 M 5,13 Q 8,8 9,3" fill="none" stroke="currentColor" stroke-width="0.6" stroke-linecap="round" />
          </svg>
        </div>
      `;

      bfEl.addEventListener('animationend', () => {
        bfEl.remove();
      });

      container.appendChild(bfEl);
    };

    const handlePointerMove = (e: PointerEvent) => {
      // clientX and clientY are the ONLY source of truth
      const rawX = e.clientX;
      const rawY = e.clientY;

      mouseRef.current = { x: rawX, y: rawY };

      if (lastSpawnRef.current.x === -100) {
        lastSpawnRef.current = { x: rawX, y: rawY };
      }

      const dx = rawX - lastSpawnRef.current.x;
      const dy = rawY - lastSpawnRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Emerge exactly from cursor tip (no offsets)
      if (dist > 15) {
        const numToSpawn = Math.random() > 0.6 ? 2 : 1;
        for (let i = 0; i < numToSpawn; i++) {
          const offsetX = (Math.random() - 0.5) * 4;
          const offsetY = (Math.random() - 0.5) * 4;
          spawnButterfly(rawX + offsetX, rawY + offsetY);
        }
        lastSpawnRef.current = { x: rawX, y: rawY };
      }

      // Hover / Magnetic target check
      const target = e.target as HTMLElement;
      if (target !== lastTargetRef.current) {
        lastTargetRef.current = target;
        const interactive = target.closest('button, a, input, textarea, [role="button"], .interactive-glow, .magnetic-target') as HTMLElement | null;
        if (interactive) {
          activeInteractiveRef.current = {
            element: interactive,
            rect: interactive.getBoundingClientRect(),
          };
          isHoveredRef.current = true;
        } else {
          activeInteractiveRef.current = null;
          isHoveredRef.current = false;
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);

    // Animation Loop (requestAnimationFrame)
    let animationId: number;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let vx = 0;
    let vy = 0;
    
    let currentWidth = 40;
    let currentHeight = 40;
    let currentScale = 1.0;

    const updateCursor = () => {
      const active = activeInteractiveRef.current;
      const rawX = mouseRef.current.x;
      const rawY = mouseRef.current.y;

      if (rawX > 0) {
        if (currentX === -100) {
          currentX = rawX;
          currentY = rawY;
        }

        if (active) {
          const rect = active.rect;
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const snapFactor = 0.35;
          targetX = rawX + (centerX - rawX) * snapFactor;
          targetY = rawY + (centerY - rawY) * snapFactor;
        } else {
          targetX = rawX;
          targetY = rawY;
        }

        // Custom spring physics
        const stiffness = 0.18;
        const damping = 0.65;
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        
        vx = (vx + dx * stiffness) * damping;
        vy = (vy + dy * stiffness) * damping;
        
        currentX += vx;
        currentY += vy;
      }

      // Update Custom Cursor styles directly to maintain 60 FPS
      const cursorEl = cursorRef.current;
      if (cursorEl && currentX > 0) {
        cursorEl.style.left = `${currentX}px`;
        cursorEl.style.top = `${currentY}px`;

        const isHovered = isHoveredRef.current;
        const targetWidth = isHovered ? 50 : 40;
        const targetHeight = isHovered ? 50 : 40;
        const targetScale = isHovered ? 1.15 : 1.0;

        currentWidth = currentWidth + (targetWidth - currentWidth) * 0.15;
        currentHeight = currentHeight + (targetHeight - currentHeight) * 0.15;
        currentScale = currentScale + (targetScale - currentScale) * 0.15;

        cursorEl.style.width = `${currentWidth}px`;
        cursorEl.style.height = `${currentHeight}px`;
        cursorEl.style.transform = `translate(-50%, -50%) scale(${currentScale})`;

        if (isHovered) {
          cursorEl.style.background = 'radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, rgba(192, 38, 211, 0.05) 60%, transparent 85%)';
          cursorEl.style.boxShadow = '0 0 35px rgba(244, 63, 94, 0.55), inset 0 0 10px rgba(255, 255, 255, 0.25)';
          cursorEl.style.border = '1.5px solid rgba(244, 63, 94, 0.5)';
        } else {
          cursorEl.style.background = 'radial-gradient(circle, rgba(244, 63, 94, 0.3) 0%, rgba(192, 38, 211, 0.15) 50%, transparent 80%)';
          cursorEl.style.boxShadow = '0 0 25px rgba(244, 63, 94, 0.25), inset 0 0 6px rgba(255, 255, 255, 0.12)';
          cursorEl.style.border = '1px solid rgba(255, 255, 255, 0.18)';
        }
      }

      // Update Canvas (heart burst effect, gold sparkles)
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const particles = particlesRef.current;

        ctx.save();
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          
          p.vx *= 0.98;
          p.vy *= 0.98;

          if (p.type === 'emoji') {
            p.alpha -= 0.016;
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
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${p.alpha})`;
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(244, 63, 94, 0.3)';
            ctx.fill();
          }
        }
        ctx.restore();
      }

      animationId = requestAnimationFrame(updateCursor);
    };

    animationId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('heart-burst', handleHeartBurst);
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[99998]">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[99998]"
        style={{ mixBlendMode: 'screen' }}
      />
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[99999] hidden md:block"
        style={{
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
}

export default React.memo(CursorGlow);
