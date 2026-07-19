'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { audio } from '../utils/audio';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';

interface FloatingWindowProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  isClosed?: boolean;
}

export default function FloatingWindow({ children, currentStep, totalSteps, isClosed = false }: FloatingWindowProps) {
  const [isMuted, setIsMuted] = useState(() => audio.getMuteState());
  const scaleFactor = 1;
  const windowRef = useRef<HTMLDivElement>(null);

  // Parallax Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for mouse parallax
  const springX = useSpring(mouseX, { stiffness: 90, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 90, damping: 20 });



  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = audio.toggleMute();
    setIsMuted(muted);
    // Visual feedback pop
    audio.playClick();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    // Calculate displacement relative to center
    const x = ((e.clientX / innerWidth) - 0.5) * 22;
    const y = ((e.clientY / innerHeight) - 0.5) * 22;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Handle global hover and click sounds for premium feedback
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, [role="button"], input[type="range"]')) {
        audio.playClick();
      }
    };

    const handleGlobalMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button, [role="button"], input[type="range"]');
      if (button && button.getAttribute('data-hovered') !== 'true') {
        button.setAttribute('data-hovered', 'true');
        audio.playHover();
      }
    };

    const handleGlobalMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button, [role="button"], input[type="range"]');
      if (button && !button.contains(e.relatedTarget as Node)) {
        button.removeAttribute('data-hovered');
      }
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('mouseover', handleGlobalMouseOver);
    window.addEventListener('mouseout', handleGlobalMouseOut);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('mouseover', handleGlobalMouseOver);
      window.removeEventListener('mouseout', handleGlobalMouseOut);
    };
  }, []);

  // Progress bar pulse effect on step change
  const [isPulsing, setIsPulsing] = useState(false);
  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      prevStepRef.current = currentStep;
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const progressWidth = ((currentStep + 1) / totalSteps) * 100;
  const isEnding = currentStep === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none p-6 md:p-8">
      {/* 1. Breathing Wrapper (Gentle float 8px) */}
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="flex items-center justify-center w-full h-full pointer-events-auto"
      >
        {/* 2. Mouse Parallax Wrapper */}
        <motion.div
          ref={windowRef}
          style={{
            x: springX,
            y: springY,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={
            isClosed
              ? { scale: 0.05, y: 350, opacity: 0 } // macOS Minimization/Minimize downward
              : { scale: scaleFactor, opacity: isEnding ? 0.85 : 1.0 } // Fade dialog slightly on ending step
          }
          transition={
            isClosed
              ? { duration: 0.85, ease: [0.25, 1, 0.5, 1] }
              : {
                  scale: { type: 'spring', stiffness: 220, damping: 22 },
                  opacity: { duration: 0.5 },
                }
          }
          className="relative overflow-hidden w-full max-w-[700px] min-h-[550px] h-auto max-h-[90vh] md:max-h-[85vh] rounded-[32px] glass-premium flex flex-col"
        >
          {/* Subtle glossy reflection overlays */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.05] pointer-events-none z-10" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none z-10" />

          {/* Top Progress bar with Pulse Glow */}
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-white/5 z-20 overflow-hidden">
            <motion.div
              className="h-full rounded-r-full"
              style={{
                background: 'linear-gradient(90deg, #fb7185 0%, #ec4899 50%, #a855f7 100%)',
              }}
              animate={{ 
                width: `${progressWidth}%`,
                boxShadow: isPulsing 
                  ? '0 0 25px rgba(244,63,94,0.95), 0 0 15px rgba(236,72,153,0.8)'
                  : '0 0 10px rgba(244,63,94,0.4)'
              }}
              transition={{ 
                width: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
                boxShadow: { duration: 0.4 }
              }}
            />
          </div>

          {/* Header Controls (macOS Dots & Audio / Step Indicator) */}
          <div className="absolute top-7 left-7 right-7 md:top-10 md:left-10 md:right-10 flex items-center justify-between z-20">
            {/* macOS window dots */}
            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
                style={{ backgroundColor: '#ff5f57', boxShadow: '0 0 5px rgba(255, 95, 87, 0.4)' }}
              />
              <div
                className="w-3.5 h-3.5 rounded-full cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
                style={{ backgroundColor: '#ffbd2e', boxShadow: '0 0 5px rgba(255, 189, 46, 0.4)' }}
              />
              <div
                className="w-3.5 h-3.5 rounded-full cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
                style={{ backgroundColor: '#28c840', boxShadow: '0 0 5px rgba(40, 200, 64, 0.4)' }}
              />
            </div>

            {/* Sound + Step Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleMuteToggle}
                className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center w-8 h-8 magnetic-target"
                title={isMuted ? 'Unmute Ambient Music' : 'Mute Music'}
              >
                {isMuted ? <FiVolumeX size={15} /> : <FiVolume2 className="animate-pulse" size={15} />}
              </button>
              
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
                Step {currentStep + 1} / {totalSteps}
              </span>
            </div>
          </div>

          {/* Inner content area */}
          <div className="w-full flex-1 flex flex-col pt-[76px] md:pt-[96px] overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div className="px-7 pb-7 md:px-10 md:pb-10 flex-1 flex flex-col justify-center">
              {children}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
