import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMouseEntropy } from '@/hooks/useMouseEntropy';
import Roulette from '@/components/Roulette';
import { showError } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';

// A simple seeded pseudo-random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const Index = () => {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [excluded, setExcluded] = useState(7);
  const [result, setResult] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const { points, clearPoints } = useMouseEntropy();

  const handleGenerate = () => {
    if (isSpinning) return;

    if (points.length < 20) {
      showError('Please move your mouse more to generate randomness.');
      return;
    }

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

    // Generate seed from mouse points
    const seed = points.reduce((acc, p) => acc + p.x + p.y, 0) * Date.now();
    
    const randomIndex = Math.floor(seededRandom(seed) * possibleNumbers.length);
    const finalNumber = possibleNumbers[randomIndex];

    setResult(finalNumber);
    setIsSpinning(true);
    clearPoints();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-4 tracking-wider uppercase" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.5)' }}>
            Random Roulette
          </h1>
          <p className="text-gray-400 mb-8">
            Your mouse movements fuel the randomness.
          </p>
          <Roulette
            targetNumber={result}
            isSpinning={isSpinning}
            min={min}
            max={max}
            onSpinEnd={() => setIsSpinning(false)}
          />
        </div>

        <Card className="w-full max-w-sm bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-yellow-400">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min">Min Number</Label>
              <Input
                id="min"
                type="number"
                value={min}
                onChange={(e) => setMin(Number(e.target.value))}
                className="bg-gray-700 border-gray-600"
                disabled={isSpinning}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Max Number</Label>
              <Input
                id="max"
                type="number"
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
                className="bg-gray-700 border-gray-600"
                disabled={isSpinning}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excluded">Lucky Number (Exclude)</Label>
              <Input
                id="excluded"
                type="number"
                value={excluded}
                onChange={(e) => setExcluded(Number(e.target.value))}
                className="bg-gray-700 border-gray-600"
                disabled={isSpinning}
              />
            </div>
            <Button
              onClick={handleGenerate}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
              disabled={isSpinning}
            >
              {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="absolute bottom-0 left-0 w-full">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;