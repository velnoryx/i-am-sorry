'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EndingProps {
  funAnswer: 'yes' | 'no';
  onComplete?: () => void;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const ENDING_MESSAGES = [
  "Thank you for taking the time to read this. It really means a lot to me.",
  "I don't expect anything in return, and I know I can't undo the past with just words.",
  "Whatever you decide for yourself, I will respect it completely.",
  "I just hope that whatever comes next, you find the peace and happiness you deserve."
];

const SPARKLES: Sparkle[] = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: 15 + (i * 9.7 + 3) % 65 + 10,
  y: 70 + (i * 2.4 + 1) % 20,
  size: 1.5 + (i * 0.8) % 2.5,
  duration: 3 + (i * 0.5) % 2.5,
  delay: (i * 0.25) % 2,
}));

export default function Ending({ onComplete }: EndingProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  // Sequencer loop for messages based on character count reading time
  useEffect(() => {
    const text = ENDING_MESSAGES[messageIndex];
    // Formula: 3500ms min time + 55ms per character
    const displayDuration = 3500 + text.length * 55;

    if (messageIndex < ENDING_MESSAGES.length - 1) {
      const timer = setTimeout(() => {
        setMessageIndex((prev) => prev + 1);
      }, displayDuration);
      return () => clearTimeout(timer);
    } else {
      // Last message finished, notify parent to trigger window minimize and fade to black
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, displayDuration);
      return () => clearTimeout(timer);
    }
  }, [messageIndex, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-10 text-center relative overflow-hidden select-none py-6">
      {/* Sparkle particles rising from the glowing heart */}
      {SPARKLES.map((s) => (
        <motion.div
          key={`ending-sparkle-${s.id}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(244,63,94,0.4))',
            boxShadow: '0 0 6px rgba(244, 63, 94, 0.6)',
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{
            y: -180,
            opacity: [0, 0.9, 0.6, 0],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Pulsing Glowing SVG Heart */}
      <div className="relative mb-2 flex items-center justify-center">
        {/* Soft background pulse radial (fully GPU-accelerated) */}
        <motion.div 
          className="absolute w-36 h-36 bg-rose-500/20 rounded-full filter blur-2xl pointer-events-none"
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.4, 0.85, 0.4],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.svg
          viewBox="0 0 32 29.6"
          className="w-20 h-20 fill-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.7)] cursor-default select-none pointer-events-none"
          animate={{
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"/>
        </motion.svg>
      </div>

      {/* Sequenced emotional messages */}
      <div className="min-h-[100px] flex items-center justify-center max-w-2xl px-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="text-2xl md:text-3xl font-serif font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-pink-200 to-purple-100 leading-relaxed tracking-wide text-balance max-w-[60ch] mx-auto"
            style={{ lineHeight: '1.8', textWrap: 'balance' }}
          >
            {'\u201C'}{ENDING_MESSAGES[messageIndex]}{`\u201D`}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Footer watermark (Slow fade) */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ delay: 2, duration: 1.5 }}
        className="text-xs uppercase tracking-widest text-slate-500 mt-6"
      >
        Take care.
      </motion.p>
    </div>
  );
}
