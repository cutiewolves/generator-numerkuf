import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useMouseEntropy } from '@/hooks/useMouseEntropy';
import { showError } from '@/utils/toast';
import EntropyCanvas from '@/components/EntropyCanvas';
import { Progress } from '@/components/ui/progress';
import CaseOpening from '@/components/CaseOpening';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import NotepadPanel from '@/components/NotepadPanel';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { History, Trash2 } from 'lucide-react';
import ConfettiEffect from '@/components/ConfettiEffect';
import ExportNotesButton from '@/components/ExportNotesButton';
import { Note } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [sessionNotes, setSessionNotes] = useState<Note[]>([]);
  const [rouletteJitterFactor, setRouletteJitterFactor] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const [displayNumbers, setDisplayNumbers] = useState<number[]>([]);
  const [winningIndex, setWinningIndex] = useState(0);

  const entropyRef = useRef<HTMLDivElement>(null);
  const { points, clearPoints } = useMouseEntropy(entropyRef, !isSpinning && !isFullScreen);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('sessionNotes');
      if (savedNotes) {
        setSessionNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage", error);
      showError("Nie udało się wczytać notatek.");
    }
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

  const handleNoteChange = (id: string, newNote: string) => {
    const updatedNotes = sessionNotes.map(note =>
      note.id === id ? { ...note, note: newNote } : note
    );
    setSessionNotes(updatedNotes);
    try {
      localStorage.setItem('sessionNotes', JSON.stringify(updatedNotes));
    } catch (error) {
      console.error("Failed to save notes to localStorage", error);
      showError("Nie udało się zapisać notatki.");
    }
  };

  const handleNoteDelete = (id: string) => {
    const updatedNotes = sessionNotes.filter(note => note.id !== id);
    setSessionNotes(updatedNotes);
    try {
      localStorage.setItem('sessionNotes', JSON.stringify(updatedNotes));
    } catch (error) {
      console.error("Failed to save notes to localStorage", error);
      showError("Nie udało się usunąć notatki.");
    }
  };

  const handleDeleteAllNotes = () => {
    setSessionNotes([]);
    try {
      localStorage.removeItem('sessionNotes');
    } catch (error) {
      console.error("Failed to clear notes from localStorage", error);
      showError("Nie udało się usunąć wszystkich notatek.");
    }
  };

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
    
    const newNote: Note = {
      id: new Date().toISOString() + Math.random(),
      number: finalNumber,
      note: '',
      timestamp: new Date().toISOString(),
    };
    const newNotes = [newNote, ...sessionNotes];
    setSessionNotes(newNotes);
    try {
      localStorage.setItem('sessionNotes', JSON.stringify(newNotes));
    } catch (error) {
      console.error("Failed to save notes to localStorage", error);
      showError("Nie udało się zapisać notatek.");
    }

    const randomJitterFactor = (Math.random() - 0.5) * 0.8; // Random factor between -0.4 and 0.4
    setRouletteJitterFactor(randomJitterFactor);

    setIsFullScreen(true);
    clearPoints();
  };

  const handleNumberInputChange = (setter: React.Dispatch<React.SetStateAction<number | ''>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setter('');
    } else {
      const num = Number(value);
      if (num >= 0) {
        setter(num);
      }
    }
  };

  const entropyProgress = Math.min((points.length / ENTROPY_TARGET) * 100, 100);
  const isBusy = isSpinning || isFullScreen;
  const buttonDisabled = isBusy || entropyProgress < 100 || min === '' || max === '' || excluded === '';
  const buttonText = isBusy ? 'Losowanie...' : 'Losuj!';

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start pt-8 p-4 lg:p-8 overflow-hidden relative">
      <ConfettiEffect isAnimating={showConfetti} onComplete={handleConfettiComplete} />
      <div className="w-full max-w-7xl mx-auto">
        <div className={cn("absolute top-4 right-4 md:top-8 md-right-8 z-20 transition-opacity duration-300 lg:hidden", isFullScreen ? "opacity-0" : "opacity-100")}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
                <History className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-gray-800 border-gray-700 text-white flex flex-col">
              <SheetHeader className="flex flex-row items-center justify-between">
                <SheetTitle className="text-yellow-400">Notatnik</SheetTitle>
                <ExportNotesButton notes={sessionNotes} disabled={sessionNotes.length === 0} />
              </SheetHeader>
              <NotepadPanel notes={sessionNotes} onNoteChange={handleNoteChange} onNoteDelete={handleNoteDelete} />
              {sessionNotes.length > 0 && (
                <div className="mt-auto pt-4 border-t border-gray-700">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Wyczyść wszystkie notatki
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Czy na pewno chcesz usunąć wszystkie notatki?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Tej operacji nie można cofnąć. Wszystkie notatki z tej sesji zostaną trwale usunięte.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 border-gray-600 hover:bg-gray-600">Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAllNotes} className="bg-red-600 hover:bg-red-700">Usuń</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        <div className={cn("text-center transition-opacity duration-300 mb-8", isFullScreen ? "opacity-0" : "opacity-100")}>
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 tracking-wider uppercase" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.5)' }}>
            Kto do odpowiedzi?
          </h1>
          <p className="text-gray-400">Wylosuj ucznia do odpowiedzi.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 flex flex-col space-y-8">
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
                      <Label htmlFor="min" className="min-h-[2.5rem] flex items-end">Pierwszy numer w dzienniku</Label>
                      <Input id="min" type="number" value={min} onChange={handleNumberInputChange(setMin)} className="bg-gray-700 border-gray-600" disabled={isBusy} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max" className="min-h-[2.5rem] flex items-end">Ostatni numer w dzienniku</Label>
                      <Input id="max" type="number" value={max} onChange={handleNumberInputChange(setMax)} className="bg-gray-700 border-gray-600" disabled={isBusy} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="excluded">"Szczęśliwy numerek" (wyklucz)</Label>
                      <Input id="excluded" type="number" value={excluded} onChange={handleNumberInputChange(setExcluded)} className="bg-gray-700 border-gray-600" disabled={isBusy} />
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

          {/* Right Column: Notepad */}
          <div className={cn("hidden lg:block transition-opacity duration-300", isFullScreen ? "opacity-0 -z-10" : "opacity-100")}>
            <Card className="bg-gray-800 border-gray-700 text-white h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-yellow-400">Notatnik</CardTitle>
                <ExportNotesButton notes={sessionNotes} disabled={sessionNotes.length === 0} />
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden">
                <NotepadPanel notes={sessionNotes} onNoteChange={handleNoteChange} onNoteDelete={handleNoteDelete} />
              </CardContent>
              {sessionNotes.length > 0 && (
                <CardFooter className="pt-4 border-t border-gray-700">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Wyczyść wszystkie notatki
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Czy na pewno chcesz usunąć wszystkie notatki?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Tej operacji nie można cofnąć. Wszystkie notatki z tej sesji zostaną trwale usunięte.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 border-gray-600 hover:bg-gray-600">Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAllNotes} className="bg-red-600 hover:bg-red-700">Usuń</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;