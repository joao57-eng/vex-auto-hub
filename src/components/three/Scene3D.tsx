import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import { useRef } from 'react';
import type { Group } from 'three';

function Wheel({ position }: { position: [number, number, number] }) {
  const wheel = useRef<Group>(null);
  useFrame((_, delta) => {
    if (wheel.current) wheel.current.rotation.z -= delta * 1.1;
  });
  return (
    <group ref={wheel} position={position}>
      <mesh>
        <torusGeometry args={[0.3, 0.095, 16, 36]} />
        <meshPhysicalMaterial color="#0a0a0a" metalness={0.7} roughness={0.35} clearcoat={0.6} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 5]}>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 24]} />
        <meshPhysicalMaterial color="#c9c9c9" metalness={1} roughness={0.12} clearcoat={1} />
      </mesh>
    </group>
  );
}

function LuxuryCoupe({ accent }: { accent: string }) {
  const car = useRef<Group>(null);
  useFrame((state) => {
    if (!car.current) return;
    car.current.rotation.y = -0.42 + state.pointer.x * 0.18;
    car.current.rotation.x = 0.04 - state.pointer.y * 0.06;
  });

  return (
    <group ref={car} rotation={[0.04, -0.42, 0]} scale={1.28} position={[0, -0.05, 0]}>
      {/* Corpo inferior — muito baixo e largo, postura agressiva */}
      <mesh position={[0, -0.2, 0]} scale={[2.15, 0.32, 0.86]}>
        <boxGeometry args={[1, 1, 1, 4, 2, 2]} />
        <meshPhysicalMaterial color="#131313" metalness={0.92} roughness={0.14} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>

      {/* Nariz afunilado e agudo */}
      <mesh position={[1.04, -0.22, 0]} scale={[0.24, 0.26, 0.66]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#131313" metalness={0.92} roughness={0.14} clearcoat={1} />
      </mesh>

      {/* Splitter dianteiro — lâmina baixa saliente */}
      <mesh position={[1.14, -0.36, 0]} scale={[0.1, 0.03, 0.9]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#050505" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Cabine baixa e curta, bem raked */}
      <mesh position={[-0.2, 0.14, 0]} scale={[0.82, 0.26, 0.72]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#1a1a1a" metalness={0.85} roughness={0.12} clearcoat={1} />
      </mesh>

      {/* Vidros */}
      <mesh position={[-0.22, 0.185, 0.005]} scale={[0.64, 0.16, 0.7]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#0d141c" transmission={0.35} opacity={0.95} transparent metalness={0.3} roughness={0.05} />
      </mesh>

      {/* Entradas de ar laterais */}
      <mesh position={[0.15, -0.2, 0.435]} scale={[0.42, 0.14, 0.02]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#020202" metalness={0.2} roughness={0.8} />
      </mesh>
      <mesh position={[0.15, -0.2, -0.435]} scale={[0.42, 0.14, 0.02]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#020202" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Farol dianteiro fino e afiado */}
      <mesh position={[1.12, -0.14, 0]} scale={[0.05, 0.045, 0.62]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#eef3ff" emissive="#eef3ff" emissiveIntensity={1.6} />
      </mesh>

      {/* Lanterna traseira, cor do tema */}
      <mesh position={[-1.08, -0.12, 0]} scale={[0.05, 0.08, 0.64]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.4} />
      </mesh>

      {/* Aerofólio traseiro — dois suportes + a asa */}
      <mesh position={[-0.92, 0.22, 0.28]} scale={[0.03, 0.16, 0.03]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.92, 0.22, -0.28]} scale={[0.03, 0.16, 0.03]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.94, 0.31, 0]} scale={[0.16, 0.025, 0.78]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#131313" metalness={0.9} roughness={0.15} clearcoat={1} />
      </mesh>
      <mesh position={[-0.94, 0.325, 0]} scale={[0.17, 0.015, 0.8]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Friso lateral fino, cor do tema */}
      <mesh position={[0, -0.02, 0.435]} scale={[1.9, 0.018, 0.008]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.02, -0.435]} scale={[1.9, 0.018, 0.008]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} metalness={0.9} roughness={0.2} />
      </mesh>

      {([-0.8, 0.76] as const).flatMap((x) =>
        [-0.72, 0.72].map((z) => <Wheel key={`${x}-${z}`} position={[x, -0.5, z]} />)
      )}
    </group>
  );
}

export default function Scene3D({ isRedTheme }: { isRedTheme: boolean }) {
  const accent = isRedTheme ? '#E53E3E' : '#C5A059';

  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0.15, 5], fov: 32 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[3, 4, 3]} intensity={80} color="#ffffff" angle={0.5} penumbra={1} />
      <pointLight position={[-3, 1.5, 2]} intensity={14} color={accent} />
      <pointLight position={[0, -1, 3]} intensity={6} color="#7fa8ff" />

      <Environment preset="studio" environmentIntensity={0.9} />

      <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.28}>
        <LuxuryCoupe accent={accent} />
      </Float>

      <ContactShadows position={[0, -0.62, 0]} opacity={0.55} scale={7} blur={2.4} far={2} color="#000000" />
    </Canvas>
  );
}
