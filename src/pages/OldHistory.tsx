import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';

const OldHistory = () => {
  const [archivedHistory, setArchivedHistory] = useState<number[]>([]);

  useEffect(() => {
    try {
      const historyStr = localStorage.getItem('archivedRouletteHistory');
      if (historyStr) {
        setArchivedHistory(JSON.parse(historyStr));
      }
    } catch (error) {
      console.error("Failed to load archived history", error);
      showError("Nie udało się wczytać archiwum.");
    }
  }, []);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('archivedRouletteHistory');
      setArchivedHistory([]);
      showSuccess("Archiwum zostało wyczyszczone.");
    } catch (error) {
      console.error("Failed to clear archived history", error);
      showError("Nie udało się wyczyścić archiwum.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="inline-flex items-center text-yellow-400 hover:text-yellow-500">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do strony głównej
          </Link>
        </div>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-yellow-400">Archiwum Losowań</CardTitle>
            {archivedHistory.length > 0 && (
              <Button variant="destructive" onClick={handleClearHistory}>
                Wyczyść Archiwum
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {archivedHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-16">Archiwum losowań jest puste.</p>
            ) : (
              <ul className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                {archivedHistory.map((num, index) => (
                  <li
                    key={`${num}-${index}`}
                    className="flex items-center justify-between bg-gray-700 p-3 rounded-md"
                  >
                    <span className="font-bold text-xl text-white">{num}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OldHistory;