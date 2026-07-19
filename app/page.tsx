'use client';

import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedBackground from './components/AnimatedBackground';
import CursorGlow from './components/CursorGlow';
import FloatingWindow from './components/FloatingWindow';
import LoadingScreen from './components/LoadingScreen';
import Landing from './components/Landing';
import Apology from './components/Apology';
import FunSection from './components/FunSection';
import Questions from './components/Questions';
import Ending from './components/Ending';

type Step = 'landing' | 'apology' | 'fun' | 'questions' | 'ending';

const STEPS: Step[] = ['landing', 'apology', 'fun', 'questions', 'ending'];

// Standardized slide/fade transitions for Awwwards experience (500-700ms duration)
const stepTransitionVariants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: 15,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeInOut' as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -15,
    transition: {
      duration: 0.6,
      ease: 'easeInOut' as const,
    },
  },
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [funAnswer, setFunAnswer] = useState<'yes' | 'no'>('yes');
  
  // Closing window and screen fade state for final ending sequence
  const [isWindowClosed, setIsWindowClosed] = useState(false);
  const [fadeToBlack, setFadeToBlack] = useState(false);

  const stepIndex = STEPS.indexOf(currentStep);

  const goToStep = useCallback((step: Step) => {
    setCurrentStep(step);
  }, []);

  const handleFunAnswer = useCallback((answer: 'yes' | 'no') => {
    setFunAnswer(answer);
    goToStep('questions');
  }, [goToStep]);

  const handleQuestionsComplete = useCallback(() => {
    goToStep('ending');
  }, [goToStep]);

  const handleEndingComplete = useCallback(() => {
    // Initiate memorable closing sequence
    setIsWindowClosed(true);
    // Wait for the window to finish closing down, then fade the screen to pitch black
    setTimeout(() => {
      setFadeToBlack(true);
    }, 1300);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* 1. Loading Screen (fades out when asset simulation completes) */}
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <>
          {/* Animated background (Aurora, moving blobs, sparks, drifting clouds, stars) */}
          <AnimatedBackground currentStep={currentStep} />

          {/* Custom magnetic trailing cursor glow */}
          <CursorGlow />

          {/* Floating glass window wrapper */}
          <FloatingWindow 
            currentStep={stepIndex} 
            totalSteps={STEPS.length}
            isClosed={isWindowClosed}
          >
            <AnimatePresence mode="wait">
              {currentStep === 'landing' && (
                <motion.div
                  key="landing"
                  variants={stepTransitionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full flex-1 flex flex-col justify-center"
                >
                  <Landing onContinue={() => goToStep('apology')} />
                </motion.div>
              )}

              {currentStep === 'apology' && (
                <motion.div
                  key="apology"
                  variants={stepTransitionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full flex-1 flex flex-col justify-center"
                >
                  <Apology onContinue={() => goToStep('fun')} />
                </motion.div>
              )}

              {currentStep === 'fun' && (
                <motion.div
                  key="fun"
                  variants={stepTransitionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full flex-1 flex flex-col justify-center"
                >
                  <FunSection onAnswer={handleFunAnswer} />
                </motion.div>
              )}

              {currentStep === 'questions' && (
                <motion.div
                  key="questions"
                  variants={stepTransitionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full flex-1 flex flex-col justify-center"
                >
                  <Questions funAnswer={funAnswer} onComplete={handleQuestionsComplete} />
                </motion.div>
              )}

              {currentStep === 'ending' && (
                <motion.div
                  key="ending"
                  variants={stepTransitionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full flex-1 flex flex-col justify-center"
                >
                  <Ending funAnswer={funAnswer} onComplete={handleEndingComplete} />
                </motion.div>
              )}
            </AnimatePresence>
          </FloatingWindow>

          {/* Final fade-to-black overlay */}
          <AnimatePresence>
            {fadeToBlack && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
                className="fixed inset-0 bg-black z-[99999] pointer-events-none"
              />
            )}
          </AnimatePresence>
        </>
      )}
    </main>
  );
}
