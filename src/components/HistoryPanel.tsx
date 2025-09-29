import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HistoryPanelProps {
  history: number[];
  min: number;
  max: number;
}

const HistoryPanel = ({ history, min, max }: HistoryPanelProps) => {
  const getItemColor = (num: number) => {
    const range = max - min;
    if (range <= 0) return 'border-l-blue-400';
    const percentage = (num - min) / range;

    if (percentage > 0.9) return 'border-l-yellow-400';
    if (percentage > 0.75) return 'border-l-red-400';
    if (percentage > 0.5) return 'border-l-purple-400';
    return 'border-l-blue-400';
  };

  return (
    <div className="h-full flex flex-col pt-4">
      <div className="flex-grow overflow-y-auto pr-4">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-center py-8">Brak historii losowań.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {history.map((num, index) => (
                <motion.li
                  key={`${num}-${history.length - index}`}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex items-center justify-between bg-gray-700 p-3 rounded-md border-l-4",
                    getItemColor(num)
                  )}
                >
                  <span className="text-gray-400 text-sm">Losowanie #{history.length - index}</span>
                  <span className="font-bold text-xl text-white">{num}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
      <div className="pt-4 mt-auto text-center">
        <Link to="/stara-historia" className="text-sm text-yellow-400 hover:underline">
          Zobacz archiwum
        </Link>
      </div>
    </div>
  );
};

export default HistoryPanel;