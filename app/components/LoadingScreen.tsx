'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Simulate progress with luxury easing curve
  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      // Slow down near the end for suspense, then speed up
      const increment = currentProgress > 80 
        ? Math.random() * 2 
        : currentProgress > 50 
        ? Math.random() * 5 + 1
        : Math.random() * 10 + 2;

      currentProgress = Math.min(100, currentProgress + increment);
      setProgress(Math.floor(currentProgress));

      if (currentProgress >= 100) {
        clearInterval(interval);
        // Soft fade out
        setTimeout(() => {
          setIsVisible(false);
        }, 600);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Handle hidden state callback
  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  // Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);

    // Initial particles
    const particles: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 80,
        y: canvas.height / 2 + (Math.random() - 0.5) * 80,
        size: 1 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        opacity: 0.2 + Math.random() * 0.6
      });
    }
    particlesRef.current = particles;

    let animationId: number;

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const items = particlesRef.current;

      items.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Attract particles slowly back to center logo
        const dx = canvas.width / 2 - p.x;
        const dy = canvas.height / 2 - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 180) {
          p.vx += dx * 0.0001;
          p.vy += dy * 0.0001;
        }

        // Slow drag
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Reset if completely out of bounds or faded
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          p.x = canvas.width / 2 + (Math.random() - 0.5) * 60;
          p.y = canvas.height / 2 + (Math.random() - 0.5) * 60;
          p.vx = (Math.random() - 0.5) * 1.5;
          p.vy = (Math.random() - 0.5) * 1.5;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = '#fda4af'; // rose-300
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#f43f5e';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationId = requestAnimationFrame(drawParticles);
    };

    animationId = requestAnimationFrame(drawParticles);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#07040c] select-none"
        >
          {/* Canvas particles */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Glowing logo / heart container */}
          <div className="relative flex flex-col items-center gap-8 z-10">
            {/* Pulsing glowing SVG logo */}
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 2.0,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="relative flex items-center justify-center"
            >
              <div className="absolute w-24 h-24 bg-rose-500/10 rounded-full filter blur-xl animate-pulse" />
              <svg
                viewBox="0 0 32 29.6"
                className="w-16 h-16 fill-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]"
              >
                <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"/>
              </svg>
            </motion.div>

            {/* Progress status & percentage bar */}
            <div className="flex flex-col items-center gap-3.5 w-60">
              <div className="flex justify-between w-full text-xs uppercase tracking-widest font-semibold text-slate-400">
                <span>Loading Letter</span>
                <span>{progress}%</span>
              </div>

              {/* Progress Line */}
              <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #fb7185, #d946ef)',
                  }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
