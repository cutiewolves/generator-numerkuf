import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMouseEntropy } from '@/hooks/useMouseEntropy';
import { showError } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';
import EntropyCanvas from '@/components/EntropyCanvas';
import { Progress } from '@/components/ui/progress';
import CaseOpening from '@/components/CaseOpening';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// A simple seeded pseudo-random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const ENTROPY_TARGET = 100; // Number of mouse points needed

const Index = () => {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(36);
  const [excluded, setExcluded] = useState(7);
  const [result, setResult] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const entropyRef = useRef<HTMLDivElement>(null);
  const { points, clearPoints } = useMouseEntropy(entropyRef, !isSpinning && !isFullScreen);

  const onSpinComplete = useCallback(() => {
    setTimeout(() => {
      setIsFullScreen(false);
      setIsSpinning(false);
    }, 2000); // Wait 2 seconds before closing fullscreen
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

    const parsedMin = parseInt(String(min), 10);
    const parsedMax = parseInt(String(max), 10);
    const parsedExcluded = parseInt(String(excluded), 10);

    if (isNaN(parsedMin) || isNaN(parsedMax)) {
      showError('Please enter valid min and max numbers.');
      return;
    }
    if (parsedMin >= parsedMax) {
      showError('Min number must be less than max number.');
      return;
    }

    const possibleNumbers = [];
    for (let i = parsedMin; i <= parsedMax; i++) {
      if (i !== parsedExcluded) {
        possibleNumbers.push(i);
      }
    }

    if (possibleNumbers.length === 0) {
      showError('No possible numbers to generate in the given range.');
      return;
    }

    const seed = points.reduce((acc, p) => acc + p.x + p.y, 0) * Date.now();
    const randomIndex = Math.floor(seededRandom(seed) * possibleNumbers.length);
    const finalNumber = possibleNumbers[randomIndex];

    setResult(finalNumber);
    setIsFullScreen(true); // Start fullscreen animation
    clearPoints();
  };

  const entropyProgress = Math.min((points.length / ENTROPY_TARGET) * 100, 100);
  const isBusy = isSpinning || isFullScreen;
  const buttonDisabled = isBusy || entropyProgress < 100;
  const buttonText = isBusy ? 'Spinning...' : 'Generate Number';

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 space-y-8 overflow-hidden">
      <div className={cn("text-center transition-opacity duration-300", isFullScreen ? "opacity-0" : "opacity-100")}>
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 tracking-wider uppercase" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.5)' }}>
          Entropy Roulette
        </h1>
        <p className="text-gray-400">Your mouse movements fuel true randomness.</p>
      </div>

      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
        className={cn(
          "w-full flex items-center justify-center",
          isFullScreen 
            ? "fixed inset-0 z-50 bg-gray-900" 
            : "max-w-4xl"
        )}
      >
        <CaseOpening 
          min={min} 
          max={max} 
          excluded={excluded} 
          result={result}
          onSpinComplete={onSpinComplete}
          shouldSpin={isSpinning}
        />
      </motion.div>

      <div className={cn("w-full max-w-4xl mx-auto flex flex-col gap-8 items-center transition-opacity duration-300", isFullScreen ? "opacity-0 -z-10" : "opacity-100")}>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-yellow-400">Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min">Min Number</Label>
                <Input id="min" type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className="bg-gray-700 border-gray-600" disabled={isBusy} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Max Number</Label>
                <Input id="max" type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="bg-gray-700 border-gray-600" disabled={isBusy} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="excluded">Lucky Number (Exclude)</Label>
                <Input id="excluded" type="number" value={excluded} onChange={(e) => setExcluded(Number(e.target.value))} className="bg-gray-700 border-gray-600" disabled={isBusy} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-yellow-400">Generate Randomness</CardTitle>
              <p className="text-sm text-gray-400 pt-1">
                Move your mouse inside the box below to generate entropy.
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
                    <p className="text-white font-bold text-lg">Spin in progress...</p>
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
      <div className={cn("absolute bottom-0 left-0 w-full transition-opacity duration-300", isFullScreen ? "opacity-0 -z-10" : "opacity-100")}>
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;