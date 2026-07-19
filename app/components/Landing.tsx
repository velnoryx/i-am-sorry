'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import MagneticButton from './MagneticButton';

interface LandingProps {
  onContinue: () => void;
}

const LINES = [
  'Hi.',
  'I built this for you because there are some things I need to say.',
  "I really hope you'll stay and read it through.",
];

const CHAR_DELAY = 60;
const LINE_PAUSE = 700;
const INITIAL_DELAY = 600;

export default function Landing({ onContinue }: LandingProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>(['']);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const startTyping = useCallback(() => {
    setIsTyping(true);
  }, []);

  // Initial delay before starting
  useEffect(() => {
    const timer = setTimeout(startTyping, INITIAL_DELAY);
    return () => clearTimeout(timer);
  }, [startTyping]);

  // Typing effect
  useEffect(() => {
    if (!isTyping || currentLineIndex >= LINES.length) return;

    const currentLine = LINES[currentLineIndex];

    if (currentCharIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          updated[currentLineIndex] = currentLine.slice(0, currentCharIndex + 1);
          return updated;
        });
        setCurrentCharIndex((prev) => prev + 1);
      }, CHAR_DELAY);
      return () => clearTimeout(timer);
    } else {
      // Line is complete, move to next line after pause
      if (currentLineIndex < LINES.length - 1) {
        const timer = setTimeout(() => {
          setCurrentLineIndex((prev) => prev + 1);
          setCurrentCharIndex(0);
          setDisplayedLines((prev) => [...prev, '']);
        }, LINE_PAUSE);
        return () => clearTimeout(timer);
      } else {
        // All lines done
        const timer = setTimeout(() => {
          setIsTyping(false);
          setAllDone(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isTyping, currentLineIndex, currentCharIndex]);




  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-10 text-center select-none py-6">
      {/* Typed Lines Container */}
      <div className="space-y-8 min-h-[180px] flex flex-col items-center justify-center max-w-2xl px-4 md:px-6">
        {displayedLines.map((line, index) => (
          <div key={index} className="flex items-center justify-center min-h-[44px]">
            {index === 0 ? (
              <h1
                className="text-5xl md:text-6xl font-serif italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-purple-200 drop-shadow-[0_2px_15px_rgba(244,63,94,0.2)] text-balance"
                style={{ lineHeight: 1.3 }}
              >
                {line}
                {index === currentLineIndex && isTyping && (
                  <span className="inline-block w-2.5 h-[1.1em] ml-1.5 bg-rose-400 animate-pulse rounded-full" />
                )}
              </h1>
            ) : (
              <p
                className="text-base md:text-lg font-sans font-light tracking-wide text-slate-300 max-w-[60ch] text-balance"
                style={{ lineHeight: 1.8, textWrap: 'balance' }}
              >
                {line}
                {index === currentLineIndex && isTyping && (
                  <span className="inline-block w-2.5 h-[1.1em] ml-1.5 bg-purple-300 animate-pulse rounded-full" />
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Spring loaded CTA Button */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: 'easeInOut',
          }}
          className="mt-8 md:mt-12"
        >
          <MagneticButton
            onClick={onContinue}
            className="px-10 py-4 rounded-full text-white font-medium text-lg shadow-lg"
          >
            Continue
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              className="inline-block"
            >
              →
            </motion.span>
          </MagneticButton>
        </motion.div>
      )}
    </div>
  );
}
