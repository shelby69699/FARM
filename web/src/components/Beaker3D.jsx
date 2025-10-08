import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedBeaker({ power, pending }) {
  const beakerRef = useRef();
  const liquidRef = useRef();
  const bubblesRef = useRef();

  // Animate liquid level based on pending rewards
  const liquidHeight = useMemo(() => {
    const minHeight = 0.5;
    const maxHeight = 2.5;
    const normalizedPending = Math.min(pending / 100, 1); // Normalize to 0-1
    return minHeight + (normalizedPending * (maxHeight - minHeight));
  }, [pending]);

  // Gentle rotation animation
  useFrame((state) => {
    if (beakerRef.current) {
      beakerRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    
    // Animate liquid
    if (liquidRef.current) {
      liquidRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05 - 0.5;
    }
  });

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.2}
      floatIntensity={0.5}
    >
      <group ref={beakerRef}>
        {/* Beaker Glass Body */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 0.8, 3, 32]} />
          <MeshTransmissionMaterial
            thickness={0.2}
            roughness={0.1}
            transmission={0.95}
            ior={1.5}
            chromaticAberration={0.02}
            backside={true}
            color="#ffffff"
          />
        </mesh>

        {/* Beaker Rim */}
        <mesh position={[0, 1.5, 0]}>
          <torusGeometry args={[1.2, 0.05, 16, 32]} />
          <meshStandardMaterial
            color="#e0e0e0"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Liquid Inside */}
        <mesh ref={liquidRef} position={[0, -0.5, 0]}>
          <cylinderGeometry args={[1.1, 0.75, liquidHeight, 32]} />
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={0.5}
            transparent={true}
            opacity={0.6}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>

        {/* Bubbles */}
        {[...Array(8)].map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.sin(i * Math.PI / 4) * 0.6,
              -1 + (i * 0.3),
              Math.cos(i * Math.PI / 4) * 0.6
            ]}
          >
            <sphereGeometry args={[0.05 + Math.random() * 0.05, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ff00ff"
              emissiveIntensity={0.2}
              transparent={true}
              opacity={0.4}
            />
          </mesh>
        ))}

        {/* Measurement Lines */}
        {[0.5, 1, 1.5].map((height, i) => (
          <group key={i} position={[0, -1 + height, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.01, 0.01, 2.4, 8]} />
              <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    </Float>
  );
}

export default function Beaker3D({ power = 100, pending = 0 }) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000000']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ff00ff" />
        <pointLight position={[5, -5, 5]} intensity={0.5} color="#00ffff" />
        
        {/* 3D Scene */}
        <AnimatedBeaker power={power} pending={pending} />
        
        {/* Environment */}
        <Environment preset="city" />
        
        {/* Camera Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}

