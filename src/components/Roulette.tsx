import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RouletteProps {
  targetNumber: number | null;
  isSpinning: boolean;
  min: number;
  max: number;
  onSpinEnd: () => void;
}

const Roulette = ({ targetNumber, isSpinning, min, max, onSpinEnd }: RouletteProps) => {
  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);
  
  const numbers = Array.from({ length: Math.min(max - min + 1, 36) }, (_, i) => min + i);
  const angleStep = 360 / numbers.length;
  const radius = 140; // In pixels

  useEffect(() => {
    if (isSpinning) {
      let spinCount = 0;
      const totalSpins = 50;
      const spinDuration = 80;

      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * numbers.length);
        setHighlightedNumber(numbers[randomIndex]);
        spinCount++;

        if (spinCount >= totalSpins) {
          clearInterval(interval);
          setHighlightedNumber(targetNumber);
          onSpinEnd();
        }
      }, spinDuration);

      return () => clearInterval(interval);
    }
  }, [isSpinning, targetNumber, numbers, onSpinEnd]);

  return (
    <div className="w-80 h-80 md:w-96 md:h-96 rounded-full bg-gray-900 border-8 border-yellow-500 relative flex items-center justify-center shadow-2xl">
      <div className="absolute w-full h-full rounded-full border-4 border-gray-700"></div>
      <div className="absolute w-2/3 h-2/3 rounded-full bg-gray-800 border-4 border-gray-600"></div>
      
      {numbers.map((num, index) => {
        const angle = angleStep * index;
        const isHighlighted = num === highlightedNumber;
        const isTarget = num === targetNumber && !isSpinning;

        return (
          <div
            key={num}
            className="absolute w-10 h-10"
            style={{
              transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
            }}
          >
            <div
              className={cn(
                "w-full h-full rounded-full flex items-center justify-center font-bold transition-all duration-100",
                isHighlighted ? "bg-yellow-400 text-black scale-125 z-20" : "bg-gray-700 text-white",
                isTarget && "bg-green-500 text-white scale-125 z-20"
              )}
            >
              {num}
            </div>
          </div>
        );
      })}

      <div className="z-10 w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border-4 border-yellow-500">
        <span className="text-4xl font-bold text-white">
          {isSpinning ? '?' : targetNumber ?? '?'}
        </span>
      </div>
    </div>
  );
};

export default Roulette;