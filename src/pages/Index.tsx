import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useMouseEntropy } from '@/hooks/useMouseEntropy';
import { showError } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';
import EntropyCanvas from '@/components/EntropyCanvas';
import { Progress } from '@/components/ui/progress';
import CaseOpening from '@/components/CaseOpening';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HistoryPanel from '@/components/HistoryPanel';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { History } from 'lucide-react';
import ConfettiEffect from '@/components/ConfettiEffect';

// A simple seeded pseudo-random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const ENTROPY_TARGET = 100; // Number of mouse points needed
const TOTAL_ITEMS = 100;
const WINNING_INDEX_AREA = { min: 80, max: 90 };

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateRandomNumber = (min: number, max: number, excluded: number) => {
  let num;
  do {
    num = getRandomInt(min, max);
  } while (num === excluded);
  return num;
};

const generateNonRepeatingRandomArray = (length: number, min: number, max: number, excluded: number) => {
  const possibleNumbers = [];
  for (let i = min; i <= max; i++) {
    if (i !== excluded) {
      possibleNumbers.push(i);
    }
  }

  if (possibleNumbers.length === 0) return [];
  if (possibleNumbers.length === 1) return Array(length).fill(possibleNumbers[0]);

  const result: number[] = [];
  let lastNumber: number | null = null;

  for (let i = 0; i < length; i++) {
    let num;
    do {
      num = generateRandomNumber(min, max, excluded);
    } while (num === lastNumber);
    result.push(num);
    lastNumber = num;
  }
  return result;
};

const Index = () => {
  const [min, setMin] = useState<number | ''>(1);
  const [max, setMax] = useState<number | ''>(36);
  const [excluded, setExcluded] = useState<number | ''>(7);
  const [result, setResult] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<number[]>([]);
  const [rouletteJitterFactor, setRouletteJitterFactor] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const [displayNumbers, setDisplayNumbers] = useState<number[]>([]);
  const [winningIndex, setWinningIndex] = useState(0);

  const entropyRef = useRef<HTMLDivElement>(null);
  const { points, clearPoints } = useMouseEntropy(entropyRef, !isSpinning && !isFullScreen);

  useEffect(() => {
    try {
      const currentHistoryStr = localStorage.getItem('rouletteHistory');
      if (currentHistoryStr) {
        const currentHistory = JSON.parse(currentHistoryStr);
        if (currentHistory.length > 0) {
          const archivedHistoryStr = localStorage.getItem('archivedRouletteHistory');
          const archivedHistory = archivedHistoryStr ? JSON.parse(archivedHistoryStr) : [];
          const newArchivedHistory = [...currentHistory, ...archivedHistory];
          localStorage.setItem('archivedRouletteHistory', JSON.stringify(newArchivedHistory));
        }
      }
    } catch (error) {
      console.error("Failed to archive history", error);
      showError("Nie udało się zarchiwizować historii.");
    }
    
    localStorage.removeItem('rouletteHistory');
    setSessionHistory([]);
  }, []);

  // Generate numbers for the roulette on initial load and when settings change
  const generateDisplayNumbers = useCallback(() => {
    if (min === '' || max === '' || excluded === '') {
      setDisplayNumbers([]);
      return;
    }

    const parsedMin = Number(min);
    const parsedMax = Number(max);
    const parsedExcluded = Number(excluded);

    if (isNaN(parsedMin) || isNaN(parsedMax) || parsedMin >= parsedMax) {
      setDisplayNumbers([]);
      return;
    }

    const newNumbers = generateNonRepeatingRandomArray(TOTAL_ITEMS, parsedMin, parsedMax, parsedExcluded);
    setDisplayNumbers(newNumbers);
  }, [min, max, excluded]);

  useEffect(() => {
    generateDisplayNumbers();
  }, [generateDisplayNumbers]);


  const handleConfettiComplete = useCallback(() => {
    setShowConfetti(false);
  }, []);

  const onSpinComplete = useCallback(() => {
    // Wait a moment to let user see the number, then show confetti and start minimizing
    setTimeout(() => {
      setShowConfetti(true);
      setIsFullScreen(false);
      setIsSpinning(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (isFullScreen && !isSpinning) {
      // Delay starting the spin to allow the fullscreen animation to finish
      const timer = setTimeout(() => {
        setIsSpinning(true);
      }, 700); // A delay to let the "morph" animation play out
      return () => clearTimeout(timer);
    }
  }, [isFullScreen, isSpinning]);

  const handleGenerate = () => {
    if (isSpinning || isFullScreen) return;

    if (min === '' || max === '' || excluded === '') {
      showError('Proszę wypełnić wszystkie pola ustawień.');
      return;
    }

    const parsedMin = parseInt(String(min), 10);
    const parsedMax = parseInt(String(max), 10);
    const parsedExcluded = parseInt(String(excluded), 10);

    if (isNaN(parsedMin) || isNaN(parsedMax)) {
      showError('Proszę podać prawidłowe liczby minimalne i maksymalne.');
      return;
    }
    if (parsedMin >= parsedMax) {
      showError('Liczba minimalna musi być mniejsza od maksymalnej.');
      return;
    }

    const possibleNumbers = [];
    for (let i = parsedMin; i <= parsedMax; i++) {
      if (i !== parsedExcluded) {
        possibleNumbers.push(i);
      }
    }

    if (possibleNumbers.length === 0) {
      showError('Brak możliwych liczb do wygenerowania w podanym zakresie.');
      return;
    }

    const seed = points.reduce((acc, p) => acc + p.x + p.y, 0) * Date.now();
    const randomIndex = Math.floor(seededRandom(seed) * possibleNumbers.length);
    const finalNumber = possibleNumbers[randomIndex];

    const winnerIndex = getRandomInt(WINNING_INDEX_AREA.min, WINNING_INDEX_AREA.max);
    
    const newNumbers = new Array(TOTAL_ITEMS).fill(0);

    if (possibleNumbers.length === 1) {
      newNumbers.fill(possibleNumbers[0]);
    } else {
      newNumbers[winnerIndex] = finalNumber;

      // Fill from winner to end
      let last = finalNumber;
      for (let i = winnerIndex + 1; i < TOTAL_ITEMS; i++) {
        let num;
        do {
          num = generateRandomNumber(parsedMin, parsedMax, parsedExcluded);
        } while (num === last);
        newNumbers[i] = num;
        last = num;
      }

      // Fill from winner to start
      last = finalNumber;
      for (let i = winnerIndex - 1; i >= 0; i--) {
        let num;
        do {
          num = generateRandomNumber(parsedMin, parsedMax, parsedExcluded);
        } while (num === last);
        newNumbers[i] = num;
        last = num;
      }
    }

    setDisplayNumbers(newNumbers);
    setWinningIndex(winnerIndex);
    setResult(finalNumber);
    
    const newHistory = [finalNumber, ...sessionHistory];
    setSessionHistory(newHistory);
    try {
      localStorage.setItem('rouletteHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
      showError("Nie udało się zapisać historii.");
    }

    const randomJitterFactor = (Math.random() - 0.5) * 0.8; // Random factor between -0.4 and 0.4
    setRouletteJitterFactor(randomJitterFactor);

    setIsFullScreen(true);
    clearPoints();
  };

  const entropyProgress = Math.min((points.length / ENTROPY_TARGET) * 100, 100);
  const isBusy = isSpinning || isFullScreen;
  const buttonDisabled = isBusy || entropyProgress < 100 || min === '' || max === '' || excluded === '';
  const buttonText = isBusy ? 'Losowanie...' : 'Losuj!';

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start pt-8 p-4 lg:p-8 overflow-hidden relative">
      <ConfettiEffect isAnimating={showConfetti} onComplete={handleConfettiComplete} />
      <div className="w-full max-w-7xl mx-auto">
        <div className={cn("absolute top-4 right-4 md:top-8 md-right-8 z-20 transition-opacity duration-300", isFullScreen ? "opacity-0" : "opacity-100")}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
                <History className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-gray-800 border-gray-700 text-white flex flex-col">
              <SheetHeader>
                <SheetTitle className="text-yellow-400">Historia losowań</SheetTitle>
              </SheetHeader>
              <HistoryPanel history={sessionHistory} min={Number(min)} max={Number(max)} />
            </SheetContent>
          </Sheet>
        </div>

        <div className={cn("text-center transition-opacity duration-300 mb-8", isFullScreen ? "opacity-0" : "opacity-100")}>
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 tracking-wider uppercase" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.5)' }}>
            Kto do odpowiedzi?
          </h1>
          <p className="text-gray-400">Wylosuj ucznia do odpowiedzi.</p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-4xl flex flex-col space-y-8">
            <div className="w-full h-48">
              <AnimatePresence initial={false}>
                {isFullScreen ? (
                  <motion.div
                    key="fullscreen"
                    className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onAnimationStart={() => setIsTransitioning(true)}
                    onAnimationComplete={() => setIsTransitioning(false)}
                  >
                    <motion.div
                      layoutId="roulette-container"
                      className="w-full"
                    >
                      <CaseOpening 
                        min={Number(min)} 
                        max={Number(max)} 
                        result={result}
                        onSpinComplete={onSpinComplete}
                        shouldSpin={isSpinning}
                        isFullScreen={true}
                        displayNumbers={displayNumbers}
                        winningIndex={winningIndex}
                        isTransitioning={isTransitioning}
                        jitterFactor={rouletteJitterFactor}
                      />
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    layoutId="roulette-container"
                    className="w-full h-full"
                    onLayoutAnimationStart={() => setIsTransitioning(true)}
                    onLayoutAnimationComplete={() => setIsTransitioning(false)}
                  >
                    <CaseOpening 
                      min={Number(min)} 
                      max={Number(max)} 
                      result={result}
                      onSpinComplete={onSpinComplete}
                      shouldSpin={isSpinning}
                      isFullScreen={false}
                      displayNumbers={displayNumbers}
                      winningIndex={winningIndex}
                      isTransitioning={isTransitioning}
                      jitterFactor={rouletteJitterFactor}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={cn("w-full flex flex-col gap-8 transition-opacity duration-300", isFullScreen ? "opacity-0 -z-10" : "opacity-100")}>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700 text-white">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">Ustawienia losowania</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min">Pierwszy numer w dzienniku</Label>
                      <Input id="min" type="number" value={min} onChange={(e) => setMin(e.target.value ? Number(e.target.value) : '')} className="bg-gray-700 border-gray-600" disabled={isBusy} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max">Ostatni numer w dzienniku</Label>
                      <Input id="max" type="number" value={max} onChange={(e) => setMax(e.target.value ? Number(e.target.value) : '')} className="bg-gray-700 border-gray-600" disabled={isBusy} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="excluded">"Szczęśliwy numerek" (wyklucz)</Label>
                      <Input id="excluded" type="number" value={excluded} onChange={(e) => setExcluded(e.target.value ? Number(e.target.value) : '')} className="bg-gray-700 border-gray-600" disabled={isBusy} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-gray-400">
                      Jak działa losowanie?{' '}
                      <Link to="/dokumentacja" className="text-yellow-400 hover:underline">
                        Przeczytaj dokumentację techniczną.
                      </Link>
                    </p>
                  </CardFooter>
                </Card>

                <Card className="bg-gray-800 border-gray-700 text-white">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">Przygotuj losowanie</CardTitle>
                    <p className="text-sm text-gray-400 pt-1">
                      Poruszaj myszką, aby zapewnić pełną losowość wyniku.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div 
                      ref={entropyRef} 
                      className={cn(
                        "w-full h-48 bg-gray-800 cursor-crosshair rounded-lg overflow-hidden relative",
                        isBusy && "cursor-not-allowed"
                      )}
                    >
                      <EntropyCanvas width={500} height={192} points={points} />
                      {isBusy && (
                        <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center transition-opacity duration-300">
                          <p className="text-white font-bold text-lg">Losowanie w toku...</p>
                        </div>
                      )}
                    </div>
                    <Progress value={entropyProgress} className="w-full [&>div]:bg-yellow-400" />
                    <Button onClick={handleGenerate} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold" disabled={buttonDisabled}>
                      {buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={cn("absolute bottom-0 left-0 w-full transition-opacity duration-300", isFullScreen ? "opacity-0 -z-10" : "opacity-100")}>
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;