import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Howl } from 'howler';

// --- Helper Functions ---
const getNumberColor = (num: number) => {
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  if (redNumbers.includes(num)) return '#B91C1C'; // red-700
  return '#1F2937'; // gray-800
};

// Easing function for smooth animation
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// --- Component Prop Types ---
interface WheelProps {
  min: number;
  max: number;
  isSpinning: boolean;
  targetNumber: number | null;
  onSpinEnd: () => void;
}

// --- 3D Components ---
const Wheel = ({ min, max, isSpinning, targetNumber, onSpinEnd }: WheelProps) => {
  const wheelRef = useRef<THREE.Group>(null);
  const [animation, setAnimation] = useState({ active: false, startTime: 0, startRotation: 0, targetRotation: 0 });

  const { spinSound, ballSound } = useMemo(() => {
    const spin = new Howl({
      src: ['/sounds/roulette-spin.mp3'],
      loop: true,
      volume: 0.5,
    });
    const ball = new Howl({
      src: ['/sounds/roulette-ball.mp3'],
      volume: 0.8,
    });
    return { spinSound: spin, ballSound: ball };
  }, []);

  useEffect(() => {
    return () => {
      spinSound.unload();
      ballSound.unload();
    };
  }, [spinSound, ballSound]);

  const numbers = useMemo(() => {
    if (typeof min !== 'number' || typeof max !== 'number' || min >= max) {
      return [];
    }
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }, [min, max]);

  const angleStep = numbers.length > 0 ? (2 * Math.PI) / numbers.length : 0;

  useEffect(() => {
    if (isSpinning && targetNumber !== null && numbers.length > 0 && wheelRef.current) {
      spinSound.play();
      const targetIndex = numbers.indexOf(targetNumber);
      if (targetIndex === -1) return;

      const currentRotation = wheelRef.current.rotation.z;
      const fullSpins = 8 * (2 * Math.PI);
      const targetAngle = -(targetIndex * angleStep);
      const finalRotation = currentRotation - (currentRotation % (2 * Math.PI)) + fullSpins + targetAngle;

      setAnimation({
        active: true,
        startTime: Date.now(),
        startRotation: currentRotation,
        targetRotation: finalRotation,
      });
    }
  }, [isSpinning, targetNumber, numbers, angleStep, spinSound]);

  useFrame(() => {
    if (!animation.active || !wheelRef.current) return;

    const duration = 8000; // 8 seconds
    const elapsedTime = Date.now() - animation.startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    const easedProgress = easeOutCubic(progress);

    wheelRef.current.rotation.z = animation.startRotation + (animation.targetRotation - animation.startRotation) * easedProgress;

    if (progress >= 1) {
      setAnimation({ ...animation, active: false });
      spinSound.stop();
      ballSound.play();
      onSpinEnd();
    }
  });

  if (numbers.length === 0) {
    return null;
  }

  return (
    <group ref={wheelRef}>
      {/* Base */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]}>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 64]} />
        <meshStandardMaterial color="#422006" />
      </mesh>
      {/* Green Felt */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 64]} />
        <meshStandardMaterial color="#166534" />
      </mesh>
      
      {/* Numbers and Pockets */}
      {numbers.map((num, index) => {
        const angle = index * angleStep;
        const radius = 1.8;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <group key={num} position={[x, y, 0.1]}>
            {/* Pocket */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.4, 0.4, 0.1]} />
              <meshStandardMaterial color={getNumberColor(num)} />
            </mesh>
            {/* Number Text */}
            <Text
              position={[0, 0, 0.06]}
              rotation={[ -Math.PI / 2, 0, -angle + Math.PI / 2]}
              fontSize={0.25}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {String(num)}
            </Text>
          </group>
        );
      })}
      {/* Center piece */}
      <mesh position={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
        <meshStandardMaterial color="#FBBF24" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

const Roulette3D = (props: WheelProps) => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <Wheel {...props} />
    </Canvas>
  );
};

export default Roulette3D;