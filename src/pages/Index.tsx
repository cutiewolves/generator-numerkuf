import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMouseEntropy } from '@/hooks/useMouseEntropy';
import Roulette3D from '@/components/Roulette3D';
import { showError } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';
import EntropyCanvas from '@/components/EntropyCanvas';
import { Progress } from '@/components/ui/progress';

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
  
  const entropyRef = useRef<HTMLDivElement>(null);
  const { points, clearPoints } = useMouseEntropy(entropyRef);

  const handleGenerate = () => {
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
    if (parsedMax - parsedMin > 35) {
      showError('The range (max - min) cannot be greater than 35 for the roulette wheel.');
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
    clearPoints();
  };

  const entropyProgress = Math.min((points.length / ENTROPY_TARGET) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 tracking-wider uppercase" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.5)' }}>
          Entropy Roulette
        </h1>
        <p className="text-gray-400">Your mouse movements fuel true randomness.</p>
      </div>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="w-full h-96 flex items-center justify-center">
          <Roulette3D
            min={min}
            max={max}
          />
        </div>

        <div className="space-y-6">
          {result !== null && (
            <Card className="bg-gray-800 border-yellow-400 text-white">
              <CardHeader className="text-center">
                <CardDescription>The generated number is</CardDescription>
                <CardTitle className="text-5xl font-bold text-yellow-400">{result}</CardTitle>
              </CardHeader>
            </Card>
          )}

          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-yellow-400">Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min">Min Number</Label>
                <Input id="min" type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className="bg-gray-700 border-gray-600" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Max Number</Label>
                <Input id="max" type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="bg-gray-700 border-gray-600" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="excluded">Lucky Number (Exclude)</Label>
                <Input id="excluded" type="number" value={excluded} onChange={(e) => setExcluded(Number(e.target.value))} className="bg-gray-700 border-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-yellow-400">Generate Randomness</CardTitle>
              <p className="text-sm text-gray-400 pt-1">Move your mouse inside the box below.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div ref={entropyRef} className="w-full h-48 bg-gray-800 cursor-crosshair rounded-lg overflow-hidden">
                <EntropyCanvas width={500} height={192} points={points} />
              </div>
              <Progress value={entropyProgress} className="w-full [&>div]:bg-yellow-400" />
              <Button onClick={handleGenerate} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold" disabled={entropyProgress < 100}>
                Generate Number
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