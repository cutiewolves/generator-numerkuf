"use client";

import React from 'react';
import Confetti from '@magicui/react-confetti';

interface ConfettiEffectProps {
  isAnimating: boolean;
  onComplete: () => void;
}

const ConfettiEffect = ({ isAnimating, onComplete }: ConfettiEffectProps) => {
  if (!isAnimating) {
    return null;
  }

  // We only want to call the onComplete callback once, so we'll attach it to just one of the cannons.
  const handleAnimationComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <>
      {/* Left Cannon */}
      <Confetti
        isAnimating={isAnimating}
        className="fixed inset-0 w-full h-full z-[100] pointer-events-none"
        particleCount={100}
        angle={45}
        spread={55}
        startVelocity={45}
        decay={0.9}
        gravity={1}
        drift={0}
        ticks={200}
        origin={{ x: 0, y: 0.7 }}
        colors={['#FACC15', '#FBBF24', '#F59E0B', '#FFFFFF']}
        onAnimationComplete={handleAnimationComplete}
      />
      {/* Right Cannon */}
      <Confetti
        isAnimating={isAnimating}
        className="fixed inset-0 w-full h-full z-[100] pointer-events-none"
        particleCount={100}
        angle={135}
        spread={55}
        startVelocity={45}
        decay={0.9}
        gravity={1}
        drift={0}
        ticks={200}
        origin={{ x: 1, y: 0.7 }}
        colors={['#FACC15', '#FBBF24', '#F59E0B', '#FFFFFF']}
      />
    </>
  );
};

export default ConfettiEffect;