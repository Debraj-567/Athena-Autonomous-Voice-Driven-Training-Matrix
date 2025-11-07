
import React, { useRef, useEffect } from 'react';
import type { WorkoutState } from '../types.ts';

interface ConstellationBackgroundProps {
  workoutState: WorkoutState;
  intensity: 'low' | 'medium' | 'high';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const STATE_COLORS: Record<WorkoutState, string> = {
  idle: '107, 114, 128',     // gray-500
  warmup: '56, 189, 248',    // sky-400
  work: '239, 68, 68',       // red-500
  rest: '52, 211, 153',      // emerald-400
  cooldown: '99, 102, 241',  // indigo-400
  finished: '251, 191, 36',   // yellow-400
};

const PARTICLE_COLOR = '255, 255, 255';


export const ConstellationBackground: React.FC<ConstellationBackgroundProps> = ({ workoutState, intensity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // FIX: The `useRef` hook requires an initial value. The call was missing an argument.
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particlesArray: Particle[];
    const speedMultiplier = { low: 0.4, medium: 1, high: 1.8 }[intensity];
    const connectionDistance = { low: 80, medium: 100, high: 120 }[intensity];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
        particlesArray = [];
        const numberOfParticles = (canvas.width * canvas.height) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            const radius = Math.random() * 1.5 + 1;
            const x = Math.random() * (canvas.width - radius * 2) + radius;
            const y = Math.random() * (canvas.height - radius * 2) + radius;
            const vx = (Math.random() - 0.5) * 0.3 * speedMultiplier;
            const vy = (Math.random() - 0.5) * 0.3 * speedMultiplier;
            particlesArray.push({ x, y, vx, vy, radius });
        }
    };

    const init = () => {
        resizeCanvas();
        createParticles();
    };

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const lineColor = STATE_COLORS[workoutState] || STATE_COLORS.idle;

      for (let i = 0; i < particlesArray.length; i++) {
        const p1 = particlesArray[i];
        
        p1.x += p1.vx;
        p1.y += p1.vy;
        
        if (p1.x - p1.radius < 0 || p1.x + p1.radius > canvas.width) p1.vx *= -1;
        if (p1.y - p1.radius < 0 || p1.y + p1.radius > canvas.height) p1.vy *= -1;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PARTICLE_COLOR}, 0.8)`;
        ctx.fill();

        for (let j = i + 1; j < particlesArray.length; j++) {
            const p2 = particlesArray[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                const opacity = 1 - distance / connectionDistance;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
      }
    };

    init();
    animate();

    window.addEventListener('resize', init);

    return () => {
      window.removeEventListener('resize', init);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [workoutState, intensity]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40" />;
};
