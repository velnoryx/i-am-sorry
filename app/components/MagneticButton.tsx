'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  disabled?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export default function MagneticButton({
  children,
  onClick,
  onMouseEnter,
  className = '',
  variant = 'primary',
  type = 'button',
  disabled = false,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  // Framer Motion values for magnetic displacement
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Springs for magnetic pull back and forth
  const springX = useSpring(x, { stiffness: 120, damping: 15, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 120, damping: 15, mass: 0.2 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();

    // Calculate displacement from button center
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Magnetic pull displacement (snaps up to 25px max)
    const deltaX = (clientX - centerX) * 0.38;
    const deltaY = (clientY - centerY) * 0.38;

    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    if (onMouseEnter) {
      onMouseEnter(e);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const rippleX = e.clientX - rect.left;
    const rippleY = e.clientY - rect.top;
    
    // Size should cover the entire button diagonal
    const size = Math.max(rect.width, rect.height) * 2.5;

    const newRipple = {
      id: Date.now() + Math.random(),
      x: rippleX,
      y: rippleY,
      size,
    };

    setRipples((prev) => [...prev, newRipple]);

    if (onClick) {
      onClick(e);
    }
  };

  // Clean up ripples after animation duration (600ms)
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 600);
    return () => clearTimeout(timer);
  }, [ripples]);

  const baseClass = variant === 'primary' ? 'btn-premium' : 'btn-secondary-premium';

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        x: springX,
        y: springY,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 14,
      }}
      className={`relative overflow-hidden cursor-pointer select-none ${baseClass} ${className} flex items-center justify-center`}
    >
      {/* 1. Button Hover Gloss Shine effect */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:animate-[shimmer_1.5s_infinite] pointer-events-none z-0" />

      {/* 2. Soft Hover Glow Shadow Layer (Primary only) */}
      {variant === 'primary' && isHovered && (
        <span className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-fuchsia-500/20 to-purple-500/20 filter blur-md opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
      )}

      {/* 3. Ripple Effect Layer */}
      <span className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/25 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}
      </span>

      {/* 4. Button Content Wrapper */}
      <span className="relative z-20 pointer-events-none flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
