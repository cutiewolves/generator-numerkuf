import * as THREE from 'three';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Cylinder } from '@react-three/drei';

interface RouletteWheelProps {
  min: number;
  max: number;
  excluded: number;
}

const WheelContent = ({ min, max, excluded }: RouletteWheelProps) => {
  const wheelRef = useRef<THREE.Group>(null!);

  // Memoize the list of numbers to display on the wheel
  const numbers = useMemo(() => {
    const nums = [];
    for (let i = min; i <= max; i++) {
      if (i !== excluded) {
        nums.push(i);
      }
    }
    return nums;
  }, [min, max, excluded]);

  // Animate the wheel's rotation on each frame
  useFrame((_state, delta) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.y += delta * 0.2; // Adjust speed here
    }
  });

  const angleStep = (2 * Math.PI) / numbers.length;
  const radius = 5;

  return (
    <group ref={wheelRef}>
      {/* The main cylinder of the wheel */}
      <Cylinder args={[radius, radius, 1, numbers.length]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#374151" /> {/* gray-700 */}
      </Cylinder>
      
      {/* The numbers distributed around the wheel */}
      {numbers.map((num, index) => {
        const angle = index * angleStep;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        return (
          <Text
            key={num}
            position={[x, 0.6, z]}
            rotation={[0, angle + Math.PI / 2, 0]}
            fontSize={0.8}
            color="#FBBF24" // amber-400
            anchorX="center"
            anchorY="middle"
          >
            {num}
          </Text>
        );
      })}
    </group>
  );
};

// A static pointer to indicate the "winning" slot
const Pointer = () => (
  <mesh position={[0, 0, 5.5]} rotation={[-Math.PI / 2, 0, 0]}>
    <coneGeometry args={[0.2, 0.5, 8]} />
    <meshStandardMaterial color="#FBBF24" /> {/* amber-400 */}
  </mesh>
);

const RouletteWheel = ({ min, max, excluded }: RouletteWheelProps) => {
  return (
    <Canvas camera={{ position: [0, 8, 12], fov: 50 }}>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <Suspense fallback={null}>
        <WheelContent min={min} max={max} excluded={excluded} />
      </Suspense>
      <Pointer />
    </Canvas>
  );
};

export default RouletteWheel;