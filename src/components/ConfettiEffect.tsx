"use client";

import React, { useEffect } from 'react';
import { Confetti } from '@/components/ui/confetti';

interface ConfettiEffectProps {
  isAnimating: boolean;
  onComplete: () => void;
}

const ConfettiEffect = ({ isAnimating, onComplete }: ConfettiEffectProps) => {
  useEffect(() => {
    if (isAnimating) {
      // Set a timer to call the onComplete callback after the animation finishes
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 4000); // Let the animation run for 4 seconds

      return () => clearTimeout(timer);
    }
  }, [isAnimating, onComplete]);

  if (!isAnimating) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-full z-[100] pointer-events-none flex items-center justify-center">
      <Confetti className="h-96 w-96" />
    </div>
  );
};

export default ConfettiEffect;