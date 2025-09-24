import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface RouletteProps {
  targetNumber: number | null;
  isSpinning: boolean;
  min: number;
  max: number;
  onSpinEnd: () => void;
}

const Roulette = ({ targetNumber, isSpinning, min, max, onSpinEnd }: RouletteProps) => {
  const [displayNumber, setDisplayNumber] = useState<number | string>('?');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSpinning) {
      setDisplayNumber('?');
      let spinCount = 0;
      const totalSpins = 30; // Controls animation duration
      const spinDuration = 100;

      intervalRef.current = window.setInterval(() => {
        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        setDisplayNumber(randomNum);
        spinCount++;
        if (spinCount >= totalSpins) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setDisplayNumber(targetNumber ?? '?');
          onSpinEnd();
        }
      }, spinDuration);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSpinning, targetNumber, min, max, onSpinEnd]);

  return (
    <div className="w-64 h-64 bg-gray-800 border-4 border-yellow-400 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <span
        className={cn(
          'text-7xl font-bold text-white transition-all duration-100 z-10',
          isSpinning ? 'text-yellow-400 animate-pulse' : 'text-green-400',
          !targetNumber && !isSpinning ? 'text-white' : ''
        )}
        style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.5)' }}
      >
        {displayNumber}
      </span>
    </div>
  );
};

export default Roulette;