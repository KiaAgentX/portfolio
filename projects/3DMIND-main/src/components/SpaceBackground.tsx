// File: src/components/SpaceBackground.tsx

import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function SpaceBackground() {
  const distantStarsRef = useRef<THREE.Points>(null);
  const mediumStarsRef = useRef<THREE.Points>(null);
  const cometsRef = useRef<THREE.Points>(null);
  const nebulaGroupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  // Distant static stars (high count, sphere distribution)
  const distantStars = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Uniform spherical distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 80 + Math.random() * 70; // far away

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Star color variation (mostly white, some blue, some orange/yellow)
      const rand = Math.random();
      if (rand > 0.85) {
        // Light blue
        colors[i * 3] = 0.7;
        colors[i * 3 + 1] = 0.85;
        colors[i * 3 + 2] = 1.0;
      } else if (rand > 0.7) {
        // Orange/yellow
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 0.5;
      } else {
        // Pure white/pale
        colors[i * 3] = 0.95;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 1.0;
      }
    }
    return { positions, colors };
  }, []);

  // Medium moving stars (drift slowly, medium distance)
  const mediumStars = useMemo(() => {
    const count = 1000;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 20;
      speeds[i] = 0.02 + Math.random() * 0.05;
    }
    return { positions, speeds };
  }, []);

  // Close fast comets (streaking effect)
  const comets = useMemo(() => {
    const count = 20;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spawn far top right, move down-left
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = -40 - Math.random() * 20;

      velocities[i * 3] = -0.15 - Math.random() * 0.25; // X
      velocities[i * 3 + 1] = -0.1 - Math.random() * 0.15; // Y
      velocities[i * 3 + 2] = 0.05 + Math.random() * 0.1; // Z
    }
    return { positions, velocities };
  }, []);

  // Nebula clouds: We will construct procedurally placed glowing mesh clouds
  const nebulae = useMemo(() => {
    const list = [];
    // 4 glowing nebula spheres with different sizes and cosmic colors
    const colors = ['#8800ff', '#ff00aa', '#00aaff', '#ffaa00'];
    const positions: [number, number, number][] = [
      [-30, -15, -50],
      [35, 20, -60],
      [-10, 25, -45],
      [20, -25, -55],
    ];
    const scales = [18, 22, 15, 20];

    for (let i = 0; i < 4; i++) {
      list.push({
        color: colors[i],
        position: positions[i],
        scale: scales[i],
      });
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Distant stars - slow rotation
    if (distantStarsRef.current) {
      distantStarsRef.current.rotation.y = time * 0.002;
      distantStarsRef.current.rotation.x = time * 0.001;
    }

    // Medium stars - slow constant drift
    if (mediumStarsRef.current) {
      const positions = mediumStarsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < mediumStars.positions.length / 3; i++) {
        // Drift in Z direction (coming closer)
        positions[i * 3 + 2] += mediumStars.speeds[i];
        // If too close, wrap back to far distance
        if (positions[i * 3 + 2] > 20) {
          positions[i * 3 + 2] = -40;
        }
      }
      mediumStarsRef.current.geometry.attributes.position.needsUpdate = true;
      mediumStarsRef.current.rotation.y = -time * 0.005;
    }

    // Comets speed streak update
    if (cometsRef.current) {
      const positions = cometsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < comets.positions.length / 3; i++) {
        positions[i * 3] += comets.velocities[i * 3];
        positions[i * 3 + 1] += comets.velocities[i * 3 + 1];
        positions[i * 3 + 2] += comets.velocities[i * 3 + 2];

        // Reset if goes off limits
        if (positions[i * 3] < -40 || positions[i * 3 + 1] < -40 || positions[i * 3 + 2] > 10) {
          positions[i * 3] = 20 + Math.random() * 20;
          positions[i * 3 + 1] = 20 + Math.random() * 20;
          positions[i * 3 + 2] = -50 - Math.random() * 10;
        }
      }
      cometsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Parallax effect with mouse movement (slight tilt of the starfield)
    if (nebulaGroupRef.current) {
      // Interpolate rotation gently to avoid jumps
      const targetRotationY = mouse.x * 0.25;
      const targetRotationX = -mouse.y * 0.25;
      
      nebulaGroupRef.current.rotation.y += (targetRotationY - nebulaGroupRef.current.rotation.y) * 0.05;
      nebulaGroupRef.current.rotation.x += (targetRotationX - nebulaGroupRef.current.rotation.x) * 0.05;
      nebulaGroupRef.current.rotation.z = time * 0.003; // Base rotating motion
    }
  });

  return (
    <group>
      {/* 1. Distant static starfield */}
      <points ref={distantStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[distantStars.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[distantStars.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation={true}
        />
      </points>

      {/* 2. Medium distance drifting stars */}
      <points ref={mediumStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[mediumStars.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#aaddff"
          size={0.25}
          transparent
          opacity={0.6}
          sizeAttenuation={true}
        />
      </points>

      {/* 3. Near comets */}
      <points ref={cometsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[comets.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffcc66"
          size={0.4}
          transparent
          opacity={0.9}
          sizeAttenuation={true}
        />
      </points>

      {/* 4. Nebula Clouds Layer */}
      <group ref={nebulaGroupRef}>
        {nebulae.map((neb, idx) => (
          <mesh key={idx} position={neb.position}>
            <sphereGeometry args={[neb.scale, 16, 16]} />
            <meshBasicMaterial
              color={neb.color}
              transparent
              opacity={0.06}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
