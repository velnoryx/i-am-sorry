'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audio } from '../utils/audio';
import MagneticButton from './MagneticButton';

interface ApologyProps {
  onContinue: () => void;
}

const APOLOGY_CARDS = [
  {
    emoji: '✉️',
    message: "This isn't an attempt to erase the past or pretend nothing happened.",
    subtext: "It's just my way of finally saying everything I should have said back then, with the honesty and maturity you always deserved.",
  },
  {
    emoji: '😔',
    message: "We ended things on good terms, but I handled my emotions so badly after the breakup.",
    subtext: "Instead of respecting your space and the distance we needed, I let myself become sarcastic and rude.",
  },
  {
    emoji: '🌑',
    message: "There were moments when my behaviour was completely out of line, and I know it made you feel scared of me.",
    subtext: "Looking back at that time now, I genuinely hate that version of myself.",
  },
  {
    emoji: '💭',
    message: "I understand completely why you lost trust in me and don't believe things could ever work.",
    subtext: "You believe the same patterns and problems will just repeat themselves, and you are entirely right to feel that way.",
  },
  {
    emoji: '🌱',
    message: "Since then, I've been working hard to look at my flaws and become a better person.",
    subtext: "Not just to try and get you back, but because I never want to let myself become that version of me again.",
  },
];

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: 'easeInOut' as const,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -30 : 30,
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.6,
      ease: 'easeInOut' as const,
    },
  }),
};

export default function Apology({ onContinue }: ApologyProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const isLastCard = currentIndex === APOLOGY_CARDS.length - 1;

  const handleNext = () => {
    // Play delight audio cue
    audio.playPop();
    
    if (isLastCard) {
      onContinue();
    } else {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const card = APOLOGY_CARDS[currentIndex];

  return (
    <div className="flex flex-col items-center justify-between flex-1 py-4 md:py-6 gap-6 md:gap-8">
      {/* Card dots indicator */}
      <div className="flex items-center gap-2.5">
        {APOLOGY_CARDS.map((_, i) => (
          <div
            key={i}
            className="h-2 rounded-full transition-all duration-500 ease-[0.16,1,0.3,1]"
            style={{
              width: i === currentIndex ? '32px' : '8px',
              background:
                i === currentIndex
                  ? 'linear-gradient(90deg, #fb7185, #d946ef)'
                  : 'rgba(255, 255, 255, 0.15)',
              boxShadow: i === currentIndex ? '0 0 12px rgba(244, 63, 94, 0.5)' : 'none'
            }}
          />
        ))}
      </div>

      {/* Card Content Area */}
      <div className="flex-1 flex items-center justify-center w-full relative my-2">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full max-w-[460px] glass-card-premium rounded-[28px] p-7 md:p-10 text-center relative overflow-hidden group min-h-[380px] flex flex-col justify-center items-center gap-6"
          >
            {/* Animated card border highlights */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Glowing circle inside the card background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-rose-500/5 rounded-full filter blur-3xl pointer-events-none" />

            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.18, type: 'spring', stiffness: 200, damping: 18 }}
              className="text-5xl md:text-6xl mb-6 select-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] cursor-default"
              whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0], transition: { rotate: { type: 'tween', duration: 0.4, ease: 'easeInOut' } } }}
            >
              {card.emoji}
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: 'easeInOut' }}
              className="text-2xl md:text-3xl font-serif italic font-semibold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-purple-200 mb-4 leading-relaxed tracking-wide text-balance"
              style={{ lineHeight: 1.8, textWrap: 'balance' }}
            >
              {card.message}
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38, duration: 0.5 }}
              className="text-base md:text-lg font-sans font-light text-slate-300 tracking-wide max-w-[60ch] text-balance"
              style={{ lineHeight: 1.8, textWrap: 'balance' }}
            >
              {card.subtext}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Button */}
      <div className="flex items-center justify-center gap-4 mt-8 md:mt-10">
        <MagneticButton
          onClick={handleNext}
          className="px-10 py-3.5 rounded-full text-white font-medium shadow-lg min-w-[150px] tracking-wide"
        >
          {isLastCard ? 'Continue' : 'Next'}
        </MagneticButton>
      </div>
    </div>
  );
}
