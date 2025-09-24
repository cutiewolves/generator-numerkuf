import { useState, useRef, useEffect } from 'react';
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
  const [hasSpunOnce, setHasSpunOnce] = useState(false);
  
  const entropyRef = useRef<HTMLDivElement>(null);
  const { points, clearPoints } = useMouseEntropy(entropyRef, !isSpinning);

  // If the user has spun once but starts moving the mouse again,
  // assume they want to generate new entropy for the next spin.
  useEffect(() => {
    if (hasSpunOnce && points.length > 10) {
      setHasSpunOnce(false);
    }
  }, [points, hasSpunOnce]);

  const handleGenerate = () => {
    if (isSpinning) return;

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

    let finalNumber;
    if (!hasSpunOnce) {
      // First spin or new entropy spin
      const seed = points.reduce((acc, p) => acc + p.x + p.y, 0) * Date.now();
      const randomIndex = Math.floor(seededRandom(seed) * possibleNumbers.length);
      finalNumber = possibleNumbers[randomIndex];
      clearPoints();
    } else {
      // "Spin Again" uses standard randomness for speed
      const randomIndex = Math.floor(Math.random() * possibleNumbers.length);
      finalNumber = possibleNumbers[randomIndex];
    }

    setIsSpinning(true);
    setResult(finalNumber);
    if (!hasSpunOnce) {
      setHasSpunOnce(true);
    }
  };

  const entropyProgress = Math.min((points.length / ENTROPY_TARGET) * 100, 100);
  const buttonDisabled = isSpinning || (!hasSpunOnce && entropyProgress < 100);
  const buttonText = isSpinning ? 'Spinning...' : hasSpunOnce ? 'Spin Again' : 'Generate Number';

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 tracking-wider uppercase" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.5)' }}>
          Entropy Roulette
        </h1>
        <p className="text-gray-400">Your mouse movements fuel true randomness.</p>
      </div>

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 items-center">
        <CaseOpening 
          min={min} 
          max={max} 
          excluded={excluded} 
          result={result}
          onSpinComplete={() => setIsSpinning(false)}
        />

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-yellow-400">Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min">Min Number</Label>
                <Input id="min" type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className="bg-gray-700 border-gray-600" disabled={isSpinning} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Max Number</Label>
                <Input id="max" type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="bg-gray-700 border-gray-600" disabled={isSpinning} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="excluded">Lucky Number (Exclude)</Label>
                <Input id="excluded" type="number" value={excluded} onChange={(e) => setExcluded(Number(e.target.value))} className="bg-gray-700 border-gray-600" disabled={isSpinning} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-yellow-400">Generate Randomness</CardTitle>
              <p className="text-sm text-gray-400 pt-1">
                {hasSpunOnce ? 'Click "Spin Again" or move your mouse to generate new entropy.' : 'Move your mouse inside the box below.'}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                ref={entropyRef} 
                className={cn(
                  "w-full h-48 bg-gray-800 cursor-crosshair rounded-lg overflow-hidden relative",
                  isSpinning && "cursor-not-allowed"
                )}
              >
                <EntropyCanvas width={500} height={192} points={points} />
                {isSpinning && (
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
      <div className="absolute bottom-0 left-0 w-full">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;