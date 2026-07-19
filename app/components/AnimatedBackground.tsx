'use client';

import React, { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  currentStep?: string;
}

interface FloatingElement {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  maxOpacity: number;
  angle: number;
  spinSpeed: number;
  color: string;
  type: 'heart' | 'petal';
  heartType?: 'fill' | 'stroke' | 'emoji';
  emoji?: string;
  wobble: number;
  wobbleSpeed: number;
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  phase: number;
  opacity: number;
  isStarShape: boolean;
}

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

function AnimatedBackground({ currentStep }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elementsRef = useRef<FloatingElement[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  const isEnding = currentStep === 'ending';

  // Initialize background elements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = [
      'rgba(244, 63, 94, ',  // rose-500
      'rgba(236, 72, 153, ', // pink-500
      'rgba(168, 85, 247, ', // purple-500
      'rgba(251, 113, 133, ' // rose-300
    ];

    const heartEmojis = ['💖', '💕', '💗', '❤️', '💜'];

    // Spawn initial elements (Hearts & Petals)
    const elementsList: FloatingElement[] = [];
    
    // Spawn Hearts (float upwards)
    for (let i = 0; i < 10; i++) {
      const maxOpacity = 0.15 + Math.random() * 0.4;
      const typeRand = Math.random();
      elementsList.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 50 + Math.random() * canvas.height,
        size: 10 + Math.random() * 18,
        speedY: 0.5 + Math.random() * 1.0,
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: 0,
        maxOpacity,
        angle: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.012,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'heart',
        heartType: typeRand < 0.4 ? 'fill' : typeRand < 0.85 ? 'stroke' : 'emoji',
        emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.008 + Math.random() * 0.015
      });
    }

    // Spawn Petals (fall downwards)
    for (let i = 0; i < 12; i++) {
      const maxOpacity = 0.2 + Math.random() * 0.45;
      elementsList.push({
        x: Math.random() * canvas.width,
        y: -100 - Math.random() * canvas.height,
        size: 8 + Math.random() * 14,
        speedY: 0.6 + Math.random() * 1.1,
        speedX: -0.4 - Math.random() * 0.6, // drift leftwards
        opacity: 0,
        maxOpacity,
        angle: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.02,
        color: `rgba(255, ${180 + Math.floor(Math.random() * 40)}, ${190 + Math.floor(Math.random() * 30)}, `, // Cherry-blossom pink hues
        type: 'petal',
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.015 + Math.random() * 0.025
      });
    }

    elementsRef.current = elementsList;

    // Twinkling stars (circles + 4-pointed stars)
    const sparklesList: Sparkle[] = [];
    const sparkleCount = 45;
    for (let i = 0; i < sparkleCount; i++) {
      sparklesList.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 2.8,
        twinkleSpeed: 0.008 + Math.random() * 0.022,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.12 + Math.random() * 0.75,
        isStarShape: Math.random() > 0.65 // ~35% are 4-pointed stars
      });
    }
    sparklesRef.current = sparklesList;

    const cloudsList: Cloud[] = [];
    for (let i = 0; i < 3; i++) {
      cloudsList.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.45),
        width: 280 + Math.random() * 180,
        height: 70 + Math.random() * 50,
        speed: 0.05 + Math.random() * 0.09,
        opacity: 0.02 + Math.random() * 0.035
      });
    }
    cloudsRef.current = cloudsList;

    const particlesList: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      particlesList.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1.2 + Math.random() * 2.5,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: -(0.15 + Math.random() * 0.45),
        opacity: 0.08 + Math.random() * 0.35
      });
    }
    particlesRef.current = particlesList;

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const drawHeartPath = (c: CanvasRenderingContext2D, d: number) => {
      c.beginPath();
      c.moveTo(0, -d / 4);
      c.bezierCurveTo(-d / 2, -d, -d, -d / 3, -d, 0);
      c.bezierCurveTo(-d, d / 2, 0, d * 1.1, 0, d * 1.35);
      c.bezierCurveTo(0, d * 1.1, d, d / 2, d, 0);
      c.bezierCurveTo(d, -d / 3, d / 2, -d, 0, -d / 4);
      c.closePath();
    };

    const drawPetalPath = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      c.moveTo(0, -size / 2);
      c.quadraticCurveTo(-size * 0.8, -size * 0.4, -size * 0.4, size * 0.4);
      c.quadraticCurveTo(0, size * 0.8, size * 0.4, size * 0.4);
      c.quadraticCurveTo(size * 0.8, -size * 0.4, 0, -size / 2);
      c.closePath();
    };

    const drawStar4 = (c: CanvasRenderingContext2D, x: number, y: number, r: number) => {
      c.beginPath();
      c.moveTo(x, y - r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.quadraticCurveTo(x, y, x, y + r);
      c.quadraticCurveTo(x, y, x - r, y);
      c.quadraticCurveTo(x, y, x, y - r);
      c.closePath();
    };

    const updateAndRender = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elements = elementsRef.current;
      const sparkles = sparklesRef.current;
      const clouds = cloudsRef.current;
      const particles = particlesRef.current;

      // 1. Draw Sparks / Stars (twinkle)
      const sparklesLimit = isEnding ? 15 : sparkles.length;
      for (let i = 0; i < sparklesLimit; i++) {
        const s = sparkles[i];
        s.phase += s.twinkleSpeed;
        const currentOpacity = s.opacity * (0.25 + 0.75 * Math.abs(Math.sin(s.phase)));
        
        ctx.save();
        ctx.globalAlpha = isEnding ? currentOpacity * 0.5 : currentOpacity;
        ctx.fillStyle = '#ffffff';
        
        const glowSize = isEnding ? s.size * 1.1 : s.size;
        
        if (s.isStarShape) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ffffff';
          drawStar4(ctx, s.x, s.y, glowSize * 2.2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, glowSize, 0, Math.PI * 2);
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#ffffff';
          ctx.fill();
        }
        ctx.restore();
      }

      // 2. Draw Clouds
      const cloudsLimit = isEnding ? 1 : clouds.length;
      for (let i = 0; i < cloudsLimit; i++) {
        const c = clouds[i];
        c.x += c.speed;
        if (c.x - c.width > canvas.width) {
          c.x = -c.width;
          c.y = Math.random() * (canvas.height * 0.45);
        }

        ctx.save();
        ctx.globalAlpha = isEnding ? c.opacity * 0.3 : c.opacity;
        ctx.fillStyle = '#ffffff';
        
        ctx.beginPath();
        const rad = c.height / 2;
        ctx.arc(c.x + rad, c.y + rad, rad, 0, Math.PI * 2);
        ctx.arc(c.x + c.width / 2, c.y + rad * 0.7, rad * 1.25, 0, Math.PI * 2);
        ctx.arc(c.x + c.width - rad, c.y + rad, rad, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw Soft Particles
      const particlesLimit = isEnding ? 5 : particles.length;
      for (let i = 0; i < particlesLimit; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.globalAlpha = isEnding ? p.opacity * 0.3 : p.opacity;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Draw Floating Elements (Hearts & Petals)
      const elementsLimit = isEnding ? 4 : elements.length;
      for (let i = 0; i < elementsLimit; i++) {
        const el = elements[i];
        // Physics update
        el.wobble += el.wobbleSpeed;
        el.angle += el.spinSpeed;

        if (el.type === 'petal') {
          // Petals fall downward and sway side-to-side
          el.y += el.speedY;
          el.x += el.speedX + Math.sin(el.wobble) * 0.6;

          // Reset if off bottom
          if (el.y > canvas.height + 50) {
            el.y = -50 - Math.random() * 100;
            el.x = Math.random() * canvas.width;
            el.opacity = 0;
            el.wobble = Math.random() * Math.PI * 2;
          } else if (el.y > canvas.height - 150) {
            // Fade out near bottom
            el.opacity = Math.max(0, el.opacity - 0.015);
          } else if (el.opacity < el.maxOpacity) {
            el.opacity = Math.min(el.maxOpacity, el.opacity + 0.012);
          }
        } else {
          // Hearts float upward and sway
          el.y -= el.speedY;
          el.x += el.speedX + Math.sin(el.wobble) * 0.4;

          // Reset if off top
          if (el.y < -50) {
            el.y = canvas.height + 50 + Math.random() * 100;
            el.x = Math.random() * canvas.width;
            el.opacity = 0;
            el.wobble = Math.random() * Math.PI * 2;
          } else if (el.y < 150) {
            // Fade out near top
            el.opacity = Math.max(0, el.opacity - 0.015);
          } else if (el.opacity < el.maxOpacity) {
            el.opacity = Math.min(el.maxOpacity, el.opacity + 0.012);
          }
        }

        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.angle);
        ctx.globalAlpha = isEnding ? el.opacity * 0.35 : el.opacity;

        if (el.type === 'petal') {
          drawPetalPath(ctx, el.size);
          // Petal color fill
          ctx.fillStyle = `${el.color}${el.opacity})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(244, 63, 94, 0.2)';
          ctx.fill();
        } else {
          drawHeartPath(ctx, el.size);
          if (el.heartType === 'fill') {
            ctx.fillStyle = `${el.color}${el.opacity})`;
            ctx.fill();
          } else if (el.heartType === 'stroke') {
            ctx.strokeStyle = `${el.color}${el.opacity})`;
            ctx.lineWidth = 1.3;
            ctx.stroke();
          } else {
            // emoji/text/symbol layout
            ctx.font = `${el.size * 1.1}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(el.emoji || '💕', 0, 0);
          }
        }
        ctx.restore();
      }

      animationId = requestAnimationFrame(updateAndRender);
    };

    animationId = requestAnimationFrame(updateAndRender);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isEnding]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden select-none pointer-events-none" aria-hidden="true">
      {/* Animated gradient base with smooth darkening during ending */}
      <div 
        className="absolute inset-0 transition-all duration-[4000ms] ease-in-out" 
        style={{
          background: isEnding
            ? 'linear-gradient(135deg, #020104 0%, #05020c 50%, #080310 100%)'
            : 'linear-gradient(135deg, #090514 0%, #120b24 35%, #1d0f33 70%, #0b0718 100%)',
          opacity: 1
        }}
      />

      {/* Background aurora-wave container (fades slightly when ending) */}
      <div 
        className="absolute inset-0 aurora-bg transition-opacity duration-[3000ms] ease-in-out"
        style={{
          opacity: isEnding ? 0.15 : 0.85
        }}
      />

      {/* Blob 1 - Pink / Rose */}
      <div
        className="absolute rounded-full transition-opacity duration-[4000ms]"
        style={{
          width: 'min(500px, 80vw)',
          height: 'min(500px, 80vw)',
          background: 'radial-gradient(circle, rgba(244,63,94,0.18) 0%, rgba(244,63,94,0.06) 45%, transparent 70%)',
          filter: 'blur(120px)',
          top: '5%',
          left: '10%',
          animation: 'blob-float-1 30s ease-in-out infinite',
          opacity: isEnding ? 0.1 : 0.8,
        }}
      />

      {/* Blob 2 - Purple / Lavender */}
      <div
        className="absolute rounded-full transition-opacity duration-[4000ms]"
        style={{
          width: 'min(550px, 90vw)',
          height: 'min(550px, 90vw)',
          background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, rgba(168,85,247,0.04) 45%, transparent 70%)',
          filter: 'blur(130px)',
          top: '35%',
          right: '5%',
          animation: 'blob-float-2 35s ease-in-out infinite',
          opacity: isEnding ? 0.08 : 0.7,
        }}
      />

      {/* Blob 3 - Rose Petal */}
      <div
        className="absolute rounded-full transition-opacity duration-[4000ms]"
        style={{
          width: 'min(420px, 70vw)',
          height: 'min(420px, 70vw)',
          background: 'radial-gradient(circle, rgba(251,113,133,0.12) 0%, rgba(251,113,133,0.03) 45%, transparent 70%)',
          filter: 'blur(120px)',
          bottom: '5%',
          left: '25%',
          animation: 'blob-float-1 28s ease-in-out infinite reverse',
          opacity: isEnding ? 0.05 : 0.65,
        }}
      />

      {/* Canvas for fine particles, stars, clouds, sparkles, and elements */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}

export default React.memo(AnimatedBackground);
