import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface HistoryPanelProps {
  history: number[];
}

const HistoryPanel = ({ history }: HistoryPanelProps) => {
  return (
    <Card className="bg-gray-800 border-gray-700 text-white h-full">
      <CardHeader>
        <CardTitle className="text-yellow-400">Historia losowań</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Brak historii losowań.</p>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-2">
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
                    className="flex items-center justify-between bg-gray-700 p-3 rounded-md"
                  >
                    <span className="text-gray-400 text-sm">Losowanie #{history.length - index}</span>
                    <span className="font-bold text-xl text-white">{num}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link to="/stara-historia" className="text-sm text-yellow-400 hover:underline w-full text-center">
          Zobacz archiwum
        </Link>
      </CardFooter>
    </Card>
  );
};

export default HistoryPanel;