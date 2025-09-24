import { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Howl } from 'howler';

interface RouletteProps {
  targetNumber: number | null;
  isSpinning: boolean;
  min: number;
  max: number;
  onSpinEnd: () => void;
}

// Sound setup
const spinSound = new Howl({
  src: ['/sounds/roulette-spin.mp3'],
  loop: true,
  volume: 0.5,
});

const ballSound = new Howl({
  src: ['/sounds/roulette-ball.mp3'],
  volume: 0.8,
});

const Roulette = ({ targetNumber, isSpinning, min, max, onSpinEnd }: RouletteProps) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const numbers = useMemo(() => 
    Array.from({ length: Math.min(max - min + 1, 36) }, (_, i) => min + i),
    [min, max]
  );

  const angleStep = 360 / numbers.length;
  const radius = 140;

  useEffect(() => {
    const wheelElement = wheelRef.current;

    const handleTransitionEnd = () => {
      spinSound.stop();
      ballSound.play();
      onSpinEnd();
    };

    if (isSpinning && targetNumber !== null) {
      const targetIndex = numbers.indexOf(targetNumber);
      if (targetIndex === -1) return;

      const fullSpins = 10;
      const randomOffset = -angleStep / 2 + Math.random() * angleStep;
      const finalAngle = (360 * fullSpins) - (targetIndex * angleStep) + randomOffset;
      
      setRotation(prev => prev + finalAngle);
      spinSound.play();
      
      wheelElement?.addEventListener('transitionend', handleTransitionEnd, { once: true });
    }

    return () => {
      wheelElement?.removeEventListener('transitionend', handleTransitionEnd);
      spinSound.stop();
    };
  }, [isSpinning, targetNumber, numbers, onSpinEnd, angleStep]);

  const getNumberColor = (num: number) => {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    if (redNumbers.includes(num)) return 'bg-red-700';
    return 'bg-gray-800';
  };

  return (
    <div className="w-96 h-96 flex items-center justify-center" style={{ perspective: '1000px' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-yellow-400 z-30"></div>
      <div
        ref={wheelRef}
        className="relative w-80 h-80 rounded-full border-8 border-yellow-600 bg-green-800 shadow-2xl transition-transform duration-[7000ms] ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(60deg) rotateZ(${rotation}deg)`,
        }}
      >
        <div className="absolute inset-0 w-full h-full rounded-full border-[16px] border-gray-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gray-900 rounded-full border-4 border-yellow-500 flex items-center justify-center">
          <span className="text-2xl font-bold text-white" style={{ transform: 'rotateX(-60deg)' }}>
            {isSpinning ? '?' : targetNumber ?? '?'}
          </span>
        </div>
        
        {numbers.map((num, index) => {
          const angle = angleStep * index;
          return (
            <div
              key={num}
              className="absolute w-full h-full"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <div
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[12px] w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm",
                  getNumberColor(num)
                )}
                style={{ transform: `translateY(${radius}px)` }}
              >
                <span style={{ transform: 'rotateX(-60deg)' }}>{num}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Roulette;