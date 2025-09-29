import { useEffect, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CaseOpeningProps {
  min: number;
  max: number;
  result: number | null;
  onSpinComplete: () => void;
  shouldSpin: boolean;
  isFullScreen?: boolean;
  displayNumbers: number[];
  winningIndex: number;
  isTransitioning?: boolean;
}

const CaseOpening = ({ min, max, result, onSpinComplete, shouldSpin, isFullScreen = false, displayNumbers, winningIndex, isTransitioning = false }: CaseOpeningProps) => {
  const controls = useAnimationControls();
  const containerRef = useRef<HTMLDivElement>(null);

  const ITEM_WIDTH_PX = isFullScreen ? 256 : 128;
  const ITEM_GAP_PX = isFullScreen ? 16 : 8;

  useEffect(() => {
    if (displayNumbers.length === 0 || !containerRef.current) return;

    const itemTotalWidth = ITEM_WIDTH_PX + ITEM_GAP_PX;
    const containerWidth = containerRef.current.offsetWidth;

    const targetOffset = winningIndex * itemTotalWidth;
    const centerOffset = containerWidth / 2 - ITEM_WIDTH_PX / 2;
    const finalX = -(targetOffset - centerOffset);

    if (shouldSpin) {
      const spin = async () => {
        controls.set({ x: 0 });
        await controls.start({
          x: finalX,
          transition: { duration: 10, ease: [0.16, 1, 0.3, 1] },
        });
        onSpinComplete();
      };

      spin();
    } else {
      // If not spinning, but we have a result, set the final position immediately.
      if (result !== null) {
        controls.set({ x: finalX });
      }
    }
  }, [shouldSpin, displayNumbers, winningIndex, result, controls, onSpinComplete, ITEM_WIDTH_PX, ITEM_GAP_PX]);

  const getItemColor = (num: number) => {
    const range = max - min;
    if (range === 0) return 'bg-blue-500/20 border-blue-400';
    const percentage = (num - min) / range;

    if (percentage > 0.9) return 'bg-yellow-500/20 border-yellow-400';
    if (percentage > 0.75) return 'bg-red-500/20 border-red-400';
    if (percentage > 0.5) return 'bg-purple-500/20 border-purple-400';
    return 'bg-blue-500/20 border-blue-400';
  };

  return (
    <div ref={containerRef} className={cn("relative w-full bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 overflow-hidden flex items-center", isFullScreen ? "h-80" : "h-48")}>
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-full w-1 bg-yellow-400 z-10 shadow-lg" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-yellow-400 z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-yellow-400 z-10" />

      <motion.div
        className={cn("flex items-center", isFullScreen ? "gap-x-4" : "gap-x-2")}
        animate={controls}
        initial={{ x: 0 }}
        style={{ opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.2s ease-in-out' }}
      >
        {displayNumbers.map((num, index) => (
          <div
            key={`${num}-${index}`}
            className={cn(
              'flex-shrink-0 rounded-md flex flex-col items-center justify-center border-2',
              getItemColor(num),
              isFullScreen ? "w-64 h-64" : "w-32 h-32"
            )}
          >
            <span className={cn("font-bold text-white", isFullScreen ? "text-7xl" : "text-4xl")}>
              {num}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default CaseOpening;