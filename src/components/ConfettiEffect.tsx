"use client";

import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

interface ConfettiEffectProps {
  isAnimating: boolean;
  onComplete: () => void;
}

// A simple hook to get the window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

const ConfettiEffect = ({ isAnimating, onComplete }: ConfettiEffectProps) => {
  const { width, height } = useWindowSize();
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      setIsRunning(true);
      // Set a timer to automatically stop the confetti and call the onComplete callback
      const timer = setTimeout(() => {
        setIsRunning(false);
        if (onComplete) {
          onComplete();
        }
      }, 6000); // Let the confetti run for 6 seconds

      return () => clearTimeout(timer);
    }
  }, [isAnimating, onComplete]);

  if (!isRunning) {
    return null;
  }

  return (
    <Confetti
      width={width}
      height={height}
      numberOfPieces={250}
      recycle={false}
      gravity={0.15}
      className="fixed inset-0 w-full h-full z-[100] pointer-events-none"
    />
  );
};

export default ConfettiEffect;