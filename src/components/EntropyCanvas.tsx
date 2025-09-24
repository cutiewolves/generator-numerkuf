import { useRef, useEffect } from 'react';

interface MousePoint {
  x: number;
  y: number;
}

interface EntropyCanvasProps {
  width: number;
  height: number;
  points: MousePoint[];
}

const EntropyCanvas = ({ width, height, points }: EntropyCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Clear canvas with a dark background
    context.fillStyle = 'rgba(31, 41, 55, 1)'; // bg-gray-800
    context.fillRect(0, 0, width, height);

    if (points.length < 2) return;

    // Draw the mouse path
    context.strokeStyle = 'rgba(250, 204, 21, 0.8)'; // yellow-400
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      context.lineTo(points[i].x, points[i].y);
    }
    context.stroke();
  }, [points, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="rounded-lg" />;
};

export default EntropyCanvas;