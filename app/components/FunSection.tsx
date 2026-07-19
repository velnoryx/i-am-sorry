'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audio } from '../utils/audio';
import MagneticButton from './MagneticButton';

interface FunSectionProps {
  onAnswer: (answer: 'yes' | 'no') => void;
}

const FUNNY_MESSAGES = [
  "I know you might not want to.",
  "I promise I'm not trying to pressure you.",
  "Just a couple of honest questions.",
  "Thank you for listening.",
];

export default function FunSection({ onAnswer }: FunSectionProps) {
  const [dodgeCount, setDodgeCount] = useState(0);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [messageIndex, setMessageIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDoneDodging = dodgeCount >= 3;

  const handleNoHover = useCallback(() => {
    if (isDoneDodging) return;

    // Play bubble pop sound on dodge
    audio.playPop();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    
    // Calculate dodge range constraints
    const maxX = Math.min(rect.width * 0.35, 160);
    const maxY = Math.min(rect.height * 0.22, 90);

    // Keep it moving to a noticeably different spot
    let randomX = (Math.random() - 0.5) * 2 * maxX;
    let randomY = (Math.random() - 0.5) * 2 * maxY;
    
    // Ensure minimum offset from last position so it doesn't stay in place
    if (Math.abs(randomX - noOffset.x) < 40) {
      randomX += randomX > 0 ? 50 : -50;
    }
    if (Math.abs(randomY - noOffset.y) < 30) {
      randomY += randomY > 0 ? 40 : -40;
    }

    setNoOffset({ x: randomX, y: randomY });
    setMessageIndex(dodgeCount % FUNNY_MESSAGES.length);
    setDodgeCount((prev) => prev + 1);
  }, [dodgeCount, isDoneDodging, noOffset]);

  const handleYesClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Fire heart burst particle explosion
    const event = new CustomEvent('heart-burst', {
      detail: { x: e.clientX, y: e.clientY }
    });
    window.dispatchEvent(event);

    // Delay slightly to let user enjoy the explosion
    setTimeout(() => {
      onAnswer('yes');
    }, 450);
  };

  const handleNoClick = () => {
    if (isDoneDodging) {
      onAnswer('no');
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center flex-1 gap-10 relative overflow-hidden select-none py-6"
    >
      {/* Emoji & Heading */}
      <div className="text-center space-y-6">
        <motion.div
          animate={{ 
            y: [0, -12, 0],
            rotate: [0, -6, 6, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
          className="text-5xl md:text-6xl select-none mb-6"
        >
          🤔
        </motion.div>
        
        <h2
          className="text-3xl md:text-4xl font-serif font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-purple-200 max-w-sm mx-auto text-balance"
          style={{ lineHeight: 1.8, textWrap: 'balance' }}
        >
          Can I ask you something?
        </h2>
      </div>

      {/* Funny transition messages */}
      <div className="h-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {messageIndex >= 0 && !isDoneDodging && (
            <motion.p
              key={`msg-${messageIndex}`}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="text-[17px] font-sans font-medium text-pink-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.2)]"
            >
              {FUNNY_MESSAGES[messageIndex]}
            </motion.p>
          )}
          {isDoneDodging && (
            <motion.p
              key="final-msg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[14px] font-sans font-medium text-slate-400"
            >
              I understand if you want to click no.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-6 md:gap-10 mt-8 md:mt-10 relative min-h-[80px]">
        {/* Yes Button (Pink Gradient & Pulsing Glow) */}
        <MagneticButton
          onClick={handleYesClick}
          className="min-w-[140px] py-4 px-8 rounded-full text-white font-medium text-lg z-10 shadow-lg"
        >
          Yes
        </MagneticButton>

        {/* No Button (Dodging Spring Wobble) */}
        <div className="relative">
          <motion.div
            animate={{
              x: noOffset.x,
              y: noOffset.y,
            }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 15,
            }}
          >
            <MagneticButton
              variant="secondary"
              onMouseEnter={handleNoHover}
              onClick={handleNoClick}
              className="min-w-[140px] py-4 px-8 rounded-full text-slate-200 font-medium text-lg shadow-md"
            >
              No
            </MagneticButton>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
