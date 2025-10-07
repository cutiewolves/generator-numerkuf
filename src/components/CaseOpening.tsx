import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

interface CaseOpeningProps {
  min: number;
  max: number;
  result: number | null;
  onSpinComplete: () => void;
  shouldSpin: boolean;
  isFullScreen: boolean;
  displayNumbers: number[];
  winningIndex: number;
  isTransitioning: boolean;
  jitterFactor: number;
}

const ITEM_WIDTH = 80; // width of each number item in pixels
const GAP = 8; // gap between items

const CaseOpening = ({
  result,
  onSpinComplete,
  shouldSpin,
  isFullScreen,
  displayNumbers,
  winningIndex,
  isTransitioning,
  jitterFactor,
}: CaseOpeningProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);

  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (shouldSpin && result !== null && containerWidth > 0) {
      const totalListWidth = displayNumbers.length * (ITEM_WIDTH + GAP);
      const finalPosition = - (winningIndex * (ITEM_WIDTH + GAP)) + (containerWidth / 2) - (ITEM_WIDTH / 2);
      
      // Add jitter
      const jitter = jitterFactor * ITEM_WIDTH;
      const finalPositionWithJitter = finalPosition + jitter;

      controls.start({
        x: [0, finalPositionWithJitter],
        transition: {
          type: 'spring',
          damping: 25,
          stiffness: 80,
          mass: 1.5,
          restDelta: 0.1,
          onComplete: onSpinComplete,
        },
      });
    } else if (!shouldSpin && result !== null && containerWidth > 0) {
      const finalPosition = - (winningIndex * (ITEM_WIDTH + GAP)) + (containerWidth / 2) - (ITEM_WIDTH / 2);
      x.set(finalPosition);
    } else {
      x.set(0);
    }
  }, [shouldSpin, result, controls, onSpinComplete, containerWidth, winningIndex, displayNumbers.length, jitterFactor, x]);

  const opacity = useTransform(x, 
    [0, -containerWidth, -(displayNumbers.length * (ITEM_WIDTH + GAP)) + containerWidth, -(displayNumbers.length * (ITEM_WIDTH + GAP))],
    [1, 1, 1, 1]
  );

  return (
    <div ref={containerRef} className={cn("relative w-full bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 overflow-hidden flex items-center", isFullScreen ? "h-80" : "h-full")}>
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-full w-1 bg-yellow-400 z-10 shadow-lg" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-yellow-400 z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-yellow-400 z-10" />

      <motion.div
        className="flex items-center"
        style={{ x, opacity, gap: `${GAP}px` }}
        animate={controls}
      >
        {displayNumbers.map((num, index) => (
          <motion.div
            key={index}
            className={cn(
              "flex-shrink-0 w-20 h-20 flex items-center justify-center rounded-md text-2xl font-bold transition-colors duration-300",
              !isTransitioning && shouldSpin && "bg-gray-700 text-white",
              !shouldSpin && result !== null && index === winningIndex && "bg-yellow-400 text-gray-900",
              !shouldSpin && (result === null || index !== winningIndex) && "bg-gray-700 text-white"
            )}
          >
            {num}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CaseOpening;