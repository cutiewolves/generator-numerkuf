import { useState, useEffect, useCallback } from 'react';

interface MousePoint {
  x: number;
  y: number;
}

export function useMouseEntropy() {
  const [points, setPoints] = useState<MousePoint[]>([]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    // We cap the points to avoid performance issues
    setPoints((prevPoints) => [...prevPoints, { x: event.clientX, y: event.clientY }].slice(-200));
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  const clearPoints = () => {
    setPoints([]);
  };

  return { points, clearPoints };
}