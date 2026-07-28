import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { useRef } from 'react';
import type { Group } from 'three';

function Wheel({ position }: { position: [number, number, number] }) {
  const wheel = useRef<Group>(null);

  useFrame((_, delta) => {
    if (wheel.current) wheel.current.rotation.z -= delta * 1.25;
  });

  return (
    <group ref={wheel} position={position}>
      <mesh>
        <torusGeometry args={[0.29, 0.1, 14, 32]} />
        <meshStandardMaterial color="#101010" metalness={0.55} roughness={0.45} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.13, 0.13, 0.035, 20]} />
        <meshStandardMaterial color="#9a9a9a" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}

function SportsCar({ accent }: { accent: string }) {
  const car = useRef<Group>(null);

  useFrame((state) => {
    if (!car.current) return;
    car.current.rotation.y = -0.36 + state.pointer.x * 0.22;
    car.current.rotation.x = 0.08 - state.pointer.y * 0.1;
  });

  return (
    <group ref={car} rotation={[0.08, -0.36, 0]} scale={1.2}>
      <mesh position={[0, -0.14, 0]} scale={[1.9, 0.48, 0.82]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#141414" metalness={0.9} roughness={0.2} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[-0.18, 0.3, 0]} scale={[0.9, 0.43, 0.7]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#1c1c1c" metalness={0.78} roughness={0.17} clearcoat={1} />
      </mesh>
      <mesh position={[-0.22, 0.34, 0.01]} scale={[0.72, 0.29, 0.71]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#101921" transmission={0.18} opacity={0.88} transparent metalness={0.45} roughness={0.08} />
      </mesh>
      <mesh position={[0.95, -0.03, 0]} scale={[0.24, 0.13, 0.7]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.6} />
      </mesh>
      <mesh position={[-0.98, -0.02, 0]} scale={[0.08, 0.1, 0.62]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f42d2d" emissive="#f42d2d" emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[0, 0.4, 0]} scale={[1.05, 0.025, 0.78]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.45} metalness={0.8} roughness={0.25} />
      </mesh>
      {([-0.75, 0.75] as const).flatMap((x) => [-0.7, 0.7].map((z) => <Wheel key={`${x}-${z}`} position={[x, -0.48, z]} />))}
    </group>
  );
}

export default function Scene3D({ isRedTheme }: { isRedTheme: boolean }) {
  const accent = isRedTheme ? '#E53E3E' : '#C5A059';

  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5.2], fov: 40 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.4} />
      <pointLight position={[3.2, 3.2, 3]} intensity={32} color={accent} />
      <pointLight position={[-3, 1, 2]} intensity={10} color="#dce8ff" />
      <Float speed={1.25} rotationIntensity={0.12} floatIntensity={0.34}>
        <SportsCar accent={accent} />
      </Float>
      <Sparkles count={54} scale={[5, 4, 2]} size={2.1} speed={0.3} color={accent} />
    </Canvas>
  );
}
