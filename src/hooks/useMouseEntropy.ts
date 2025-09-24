import { useState, useEffect, useCallback, RefObject } from 'react';

interface MousePoint {
  x: number;
  y: number;
}

export function useMouseEntropy(ref: RefObject<HTMLElement>) {
  const [points, setPoints] = useState<MousePoint[]>([]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      // We cap the points to avoid performance issues
      setPoints((prevPoints) => [...prevPoints, { x, y }].slice(-200));
    }
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      // Cast to EventListener to satisfy addEventListener's type signature
      const listener = handleMouseMove as EventListener;
      element.addEventListener('mousemove', listener);
      return () => {
        element.removeEventListener('mousemove', listener);
      };
    }
  }, [ref, handleMouseMove]);

  const clearPoints = useCallback(() => {
    setPoints([]);
  }, []);

  return { points, clearPoints };
}