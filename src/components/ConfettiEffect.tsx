"use client";

import { useEffect, useRef } from 'react';

interface ConfettiEffectProps {
  onComplete: () => void;
}

const ConfettiEffect = ({ onComplete }: ConfettiEffectProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(error => {
        console.error("Video play failed:", error);
        // If autoplay fails, just call onComplete immediately.
        onComplete();
      });

      const handleVideoEnd = () => {
        onComplete();
      };
      video.addEventListener('ended', handleVideoEnd);
      
      return () => {
        video.removeEventListener('ended', handleVideoEnd);
      };
    } else {
      // if video element is not there for some reason
      onComplete();
    }
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <video ref={videoRef} muted playsInline className="w-full h-full object-cover">
        <source src="/confetti.webm" type="video/webm" />
      </video>
    </div>
  );
};

export default ConfettiEffect;