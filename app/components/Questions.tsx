'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audio } from '../utils/audio';
import { supabase } from '../utils/supabase';
import MagneticButton from './MagneticButton';

const MAX_CHARS = 2000;
const WARN_THRESHOLD = 1800;

interface QuestionsProps {
  funAnswer?: 'yes' | 'no';
  onComplete: (answers: string[]) => void;
}

const QUESTIONS = [
  {
    emoji: '💬',
    question: 'I want to make sure I truly understand the impact of my actions. If you feel comfortable sharing, what did my behaviour feel like from your perspective?',
    type: 'textarea' as const,
    placeholder: 'I want to hear your side, without any excuses from me...',
  },
  {
    emoji: '🌱',
    question: 'I want to learn how to love with patience and respect instead of letting my emotions control me. What does that look like to you?',
    type: 'textarea' as const,
    placeholder: 'What does consistency and emotional maturity mean to you now...',
  },
  {
    emoji: '🤝',
    question: 'How much do you feel that actions and consistency matter more than any words I can say?',
    type: 'range' as const,
    placeholder: '',
  },
];

// Typewriter revealing with elegant Serif typography
const TypewriterHeading = ({ text, keyTrigger }: { text: string; keyTrigger: number }) => {
  const letters = Array.from(text);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.08,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 240,
        damping: 14,
      },
    },
  };

  return (
    <motion.h3
      key={keyTrigger}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-2xl md:text-3xl font-serif font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-purple-200 mb-6 leading-relaxed tracking-wide min-h-[72px] text-balance max-w-[60ch] mx-auto"
      style={{ lineHeight: 1.8, textWrap: 'balance' }}
    >
      {letters.map((char, index) => (
        <motion.span key={index} variants={letterVariants}>
          {char}
        </motion.span>
      ))}
    </motion.h3>
  );
};

export default function Questions({ funAnswer, onComplete }: QuestionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(''));
  const [rangeValue, setRangeValue] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLastQuestion = currentIndex === QUESTIONS.length - 1;
  const question = QUESTIONS[currentIndex];

  // Character count for current textarea
  const currentCharCount = question.type === 'textarea' ? answers[currentIndex].length : 0;
  const isAtLimit = currentCharCount >= MAX_CHARS;
  const isNearLimit = currentCharCount >= WARN_THRESHOLD;

  const handleTextareaInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
    }
  }, []);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    audio.playKeypress();
    // Enforce 2000 character limit
    const value = e.target.value.slice(0, MAX_CHARS);
    const updated = [...answers];
    updated[currentIndex] = value;
    setAnswers(updated);
  };

  // Prevent pasting beyond the limit
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const currentText = answers[currentIndex];
    const selectionStart = e.currentTarget.selectionStart ?? currentText.length;
    const selectionEnd = e.currentTarget.selectionEnd ?? currentText.length;

    // Calculate what the text would be after paste
    const beforeSelection = currentText.slice(0, selectionStart);
    const afterSelection = currentText.slice(selectionEnd);
    const newText = beforeSelection + pastedText + afterSelection;

    if (newText.length > MAX_CHARS) {
      e.preventDefault();
      // Truncate pasted content to fit within limit
      const allowedPasteLength = MAX_CHARS - beforeSelection.length - afterSelection.length;
      if (allowedPasteLength > 0) {
        const truncatedPaste = pastedText.slice(0, allowedPasteLength);
        const finalText = beforeSelection + truncatedPaste + afterSelection;
        const updated = [...answers];
        updated[currentIndex] = finalText;
        setAnswers(updated);
      }
    }
  };

  const handleSubmit = async (updatedAnswers: string[]) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('responses').insert({
        fun_section_choice: funAnswer ?? null,
        question_answers: QUESTIONS.map((q, i) => ({
          question: q.question,
          type: q.type,
          answer: updatedAnswers[i],
        })),
        final_choice: null,
      });

      if (!error) {
        setSubmitSuccess(true);
        // Show success message briefly, then proceed
        setTimeout(() => {
          onComplete(updatedAnswers);
        }, 2000);
      } else {
        // On failure, still proceed (don't block the experience)
        console.error('Failed to save response:', error.message);
        onComplete(updatedAnswers);
      }
    } catch (err) {
      console.error('Error saving response:', err);
      // On error, still proceed
      onComplete(updatedAnswers);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Play pop sound
    audio.playPop();

    let updatedValue = answers[currentIndex];
    if (question.type === 'range') {
      updatedValue = rangeValue.toString();
    }

    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = updatedValue;
    setAnswers(updatedAnswers);

    if (isLastQuestion) {
      // Trigger a beautiful celebratory heart-burst on submit
      const event = new CustomEvent('heart-burst', {
        detail: { x: e.clientX, y: e.clientY }
      });
      window.dispatchEvent(event);

      // Save to database then proceed
      handleSubmit(updatedAnswers);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (question.type === 'textarea') {
      setTimeout(handleTextareaInput, 50);
    }
  }, [currentIndex, question.type, handleTextareaInput]);

  // If submission was successful, show the success message
  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-4 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="text-6xl"
          >
            ✨
          </motion.div>
          <p className="text-xl md:text-2xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-purple-200 leading-relaxed tracking-wide">
            Your response has been submitted successfully.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between flex-1 py-4 gap-8">
      {/* Segmented Progress Indicators */}
      <div className="flex flex-col items-center gap-2.5 w-full max-w-[320px]">
        <div className="flex gap-2 w-full justify-between">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden"
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #fb7185, #d946ef)',
                }}
                initial={{ width: 0 }}
                animate={{ width: i <= currentIndex ? '100%' : '0%' }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            </div>
          ))}
        </div>
        <span className="text-[12px] font-sans font-medium tracking-wider text-slate-400 uppercase">
          Question {currentIndex + 1} of {QUESTIONS.length}
        </span>
      </div>

      {/* Main card */}
      <div className="flex-1 flex items-center justify-center w-full relative my-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{
              duration: 0.6,
              ease: 'easeInOut'
            }}
            className="w-full max-w-[460px] glass-card-premium rounded-[28px] p-7 md:p-10 text-center relative overflow-hidden group min-h-[380px] flex flex-col justify-center items-center gap-6"
          >
            {/* Soft inner glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-purple-500/5 to-rose-500/5 pointer-events-none" />

            {/* Float Emoji */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 18 }}
              className="text-5xl md:text-6xl mb-6 select-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.12)] cursor-default"
              whileHover={{ scale: 1.15 }}
            >
              {question.emoji}
            </motion.div>

            {/* Typewritten Heading */}
            <TypewriterHeading text={question.question} keyTrigger={currentIndex} />

            {/* Interactive Inputs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
              className="w-full"
            >
              {question.type === 'textarea' ? (
                <div className="w-full">
                  <textarea
                    ref={textareaRef}
                    value={answers[currentIndex]}
                    onChange={handleTextareaChange}
                    onPaste={handlePaste}
                    onInput={handleTextareaInput}
                    maxLength={MAX_CHARS}
                    placeholder={question.placeholder}
                    className="glass-textarea-premium custom-scrollbar text-slate-200"
                    rows={3}
                  />
                  {/* Character counter */}
                  <div className="flex items-center justify-between mt-2 px-1">
                    <div className="h-5">
                      <AnimatePresence>
                        {isAtLimit && (
                          <motion.span
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-[12px] font-sans font-medium"
                            style={{ color: '#f43f5e' }}
                          >
                            Character limit reached.
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <span
                      className="text-[13px] font-sans font-medium tabular-nums tracking-wide transition-colors duration-300"
                      style={{
                        color: isAtLimit
                          ? '#f43f5e'        // accent (rose-500) at 2000
                          : isNearLimit
                          ? '#f59e0b'        // amber at 1800+
                          : 'rgba(148, 163, 184, 0.7)', // slate-400 default
                      }}
                    >
                      {currentCharCount} / {MAX_CHARS}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 px-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-400 tracking-wide select-none uppercase">
                    <span>Not at all</span>
                    <span>So much!</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rangeValue}
                    onChange={(e) => setRangeValue(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <motion.div
                    key={rangeValue}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold font-sans tracking-tight gradient-text-premium"
                  >
                    {rangeValue} / 10
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-center gap-4 mt-8 md:mt-10">
        <MagneticButton
          onClick={handleNext}
          disabled={isSubmitting}
          className="px-10 py-3.5 rounded-full text-white font-medium shadow-lg min-w-[150px] tracking-wide"
        >
          {isSubmitting ? 'Saving...' : isLastQuestion ? 'Submit' : 'Next'}
        </MagneticButton>
      </div>
    </div>
  );
}
