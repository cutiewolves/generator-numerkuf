import { useMemo, useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

interface RouletteWheelProps {
  min: number;
  max: number;
  excluded: number;
  result: number | null;
  onSpinComplete: () => void;
}

const RouletteWheel = ({ min, max, excluded, result, onSpinComplete }: RouletteWheelProps) => {
  const controls = useAnimationControls();

  const numbers = useMemo(() => {
    const nums = [];
    for (let i = min; i <= max; i++) {
      if (i !== excluded) {
        nums.push(i);
      }
    }
    return nums;
  }, [min, max, excluded]);

  useEffect(() => {
    if (result !== null) {
      const resultIndex = numbers.findIndex((n) => n === result);
      if (resultIndex === -1) return;

      const anglePerSegment = 360 / numbers.length;
      const targetAngle = -resultIndex * anglePerSegment;

      const extraSpins = 5 + Math.random() * 3;
      const finalRotation = 360 * extraSpins + targetAngle;

      const spin = async () => {
        await controls.start({
          rotate: finalRotation,
          transition: {
            duration: 5,
            ease: 'easeOut',
          },
        });
        onSpinComplete();
      };

      spin();
    }
  }, [result, numbers, controls, onSpinComplete]);

  const segmentAngle = 360 / numbers.length;
  const radius = 140; // in pixels

  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-yellow-400 z-10" />

      {/* Wheel */}
      <motion.div
        className="relative w-full h-full rounded-full border-8 border-gray-700 bg-gray-800 shadow-lg"
        animate={controls}
        initial={{ rotate: 0 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gray-700 border-4 border-gray-600" />
        {numbers.map((num, index) => {
          const angle = segmentAngle * index;
          const x = radius * Math.sin((angle * Math.PI) / 180);
          const y = -radius * Math.cos((angle * Math.PI) / 180);

          return (
            <div
              key={num}
              className="absolute top-1/2 left-1/2 w-10 h-10 flex items-center justify-center font-bold text-lg"
              style={{
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle}deg)`,
                color: index % 2 === 0 ? '#FBBF24' : 'white',
              }}
            >
              <span style={{ transform: `rotate(-${angle}deg)` }}>{num}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default RouletteWheel;