"use client";

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiEffectProps {
  isAnimating: boolean;
  onComplete: () => void;
}

const ConfettiEffect = ({ isAnimating, onComplete }: ConfettiEffectProps) => {
  useEffect(() => {
    if (isAnimating) {
      const end = Date.now() + 3 * 1000; // 3 seconds
      const colors = ["#facc15", "#fb923c", "#f87171", "#ffffff"]; // Yellow, orange, red, white to match the theme

      const frame = () => {
        if (Date.now() > end) {
          onComplete();
          return;
        }

        // Left cannon
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          startVelocity: 60,
          origin: { x: 0, y: 0.5 },
          colors: colors,
        });
        // Right cannon
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1, y: 0.5 },
          colors: colors,
        });

        requestAnimationFrame(frame);
      };

      frame();
    }
  }, [isAnimating, onComplete]);

  return null; // This component doesn't render anything itself
};

export default ConfettiEffect;