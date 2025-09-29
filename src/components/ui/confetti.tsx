"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useCallback, useMemo, useState, type ComponentProps } from "react";

const PARTICLE_COUNT = 20;
const STAR_COUNT = 10;

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

type Particle = {
  x: number;
  y: number;
  degree: number;
};

type Star = {
  x: number;
  y: number;
  scale: number;
  degree: number;
};

export function Confetti({ className, ...props }: ComponentProps<"div">) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stars, setStars] = useState<Star[]>([]);

  const shoot = useCallback(() => {
    const newParticles = Array.from({ length: PARTICLE_COUNT }, (_) => ({
      x: rand(20, 80),
      y: rand(20, 80),
      degree: rand(0, 360),
    }));
    const newStars = Array.from({ length: STAR_COUNT }, (_) => ({
      x: rand(0, 100),
      y: rand(0, 100),
      scale: rand(5, 10) / 10,
      degree: rand(0, 360),
    }));
    setParticles(newParticles);
    setStars(newStars);
  }, []);

  const colors = useMemo(
    () => [
      "#FACC15", // yellow-400
      "#FBBF24", // yellow-500
      "#F59E0B", // amber-500
      "#FFFFFF",
    ],
    [],
  );

  return (
    <div
      className={cn(
        "pointer-events-none relative h-full w-full overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <motion.svg
            key={i}
            className="absolute h-3 w-3"
            style={{
              top: `${star.y}%`,
              left: `${star.x}%`,
            }}
            initial={{
              opacity: 0,
              scale: 0,
              rotate: "0deg",
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: star.scale,
              rotate: `${star.degree}deg`,
            }}
            transition={{
              duration: 0.4,
              delay: 0.1 + i * 0.03,
              ease: "easeOut",
            }}
          >
            <path
              stroke="none"
              d="M12,17.27L18.18,21L17,14.64L22,9.27L15.45,8.63L12,3L8.55,8.63L2,9.27L7,14.64L5.82,21L12,17.27Z"
              fill={colors[i % colors.length]}
            />
          </motion.svg>
        ))}
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-4 rounded-full"
            onAnimationComplete={shoot}
            style={{
              top: `${particle.y}%`,
              left: `${particle.x}%`,
              backgroundColor: colors[i % colors.length],
            }}
            initial={{
              opacity: 0,
              y: 0,
              x: 0,
              rotate: "0deg",
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [0, -20, -20, -20],
              x: [0, 0, 20, 0],
              rotate: `${particle.degree}deg`,
            }}
            transition={{
              duration: 0.4,
              delay: 0.1 + i * 0.03,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}