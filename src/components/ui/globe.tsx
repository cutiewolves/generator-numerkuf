"use client";

import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { useSpring } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";

type Marker = {
  location: [number, number];
  size: number;
};

type GlobeConfig = {
  width?: number;
  height?: number;
  onRender?: (state: Record<string, any>) => void;
  phi?: number;
  theta?: number;
  dark?: number;
  diffuse?: number;
  mapSamples?: number;
  mapBrightness?: number;
  baseColor?: [number, number, number];
  markerColor?: [number, number, number];
  glowColor?: [number, number, number];
  markers?: Marker[];
};

type GlobeProps = ComponentProps<"canvas"> & {
  config: GlobeConfig;
};

const GLOBE_CONFIG: GlobeConfig = {
  width: 800,
  height: 800,
  onRender: () => {},
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1.2, 1.2, 1.2],
  markers: [],
};

export function Globe({
  className,
  config = GLOBE_CONFIG,
  ...props
}: GlobeProps) {
  let phi = useSpring(0, {
    damping: 20,
    stiffness: 200,
  });
  let canvasRef = useRef<HTMLCanvasElement>(null);
  let [mounted, setMounted] = useState(false);

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!mounted) {
        phi.set(config.phi ?? 0);
        setMounted(true);
      }
      state.phi = phi.get();
      config.onRender?.(state);
    },
    [mounted, phi, config],
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    let width = 0;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (context) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width * dpr;
      const height = rect.height * dpr;
      canvas.width = width;
      canvas.height = height;
      context.scale(dpr, dpr);
    }

    const globe = createGlobe(canvas, {
      ...config,
      width: width,
      height: width,
      onRender,
    });

    setTimeout(() => (canvas.style.opacity = "1"));
    return () => globe.destroy();
  }, [config, onRender]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        contain: "layout paint size",
        opacity: 0,
        transition: "opacity 1s ease",
      }}
      className={cn("h-full w-full", className)}
      {...props}
    />
  );
}