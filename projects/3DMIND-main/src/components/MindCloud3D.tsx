// File: src/components/MindCloud3D.tsx

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMindDataStore, MindNode } from '../store/mindDataStore';
import { eventBus } from '../engine/eventBus';
import SpaceBackground from './SpaceBackground';
import PostProcessing from './PostProcessing';
import { Target, Compass, Activity, Zap, Network } from 'lucide-react';

interface CameraControllerProps {
  autoFocus: boolean;
  activeNode: MindNode | null;
}

// Camera controller inside the Canvas to handle animations and effects
function CameraController({ autoFocus, activeNode }: CameraControllerProps) {
  const { camera } = useThree();
  const nodes = useMindDataStore((state) => state.nodes);

  // Camera targets
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 22));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Dynamic animations
  const animType = useRef<'orbit' | 'zoom' | 'fly'>('orbit');
  const lastEventTime = useRef(0);
  const lastSlTime = useRef(0);

  // Auto-Focus / Most Recent Activity tracking
  const mostRecentNodeId = useRef<string | null>(null);
  const lastActiveNodePos = useRef<THREE.Vector3 | null>(null);

  // Set initial focus node on mount or node updates
  useEffect(() => {
    if (nodes.length > 0 && !lastActiveNodePos.current) {
      const latestNode = nodes[nodes.length - 1];
      mostRecentNodeId.current = latestNode.id;
      lastActiveNodePos.current = new THREE.Vector3().fromArray(latestNode.position);
    }
  }, [nodes]);

  // Track active node selection from prop
  useEffect(() => {
    if (activeNode) {
      mostRecentNodeId.current = activeNode.id;
      lastActiveNodePos.current = new THREE.Vector3().fromArray(activeNode.position);
      lastEventTime.current = Date.now();
    }
  }, [activeNode]);

  useEffect(() => {
    // Listen to node creations to trigger camera movement
    const unsubscribeNode = eventBus.on('node-created', (data: any) => {
      const { id, position, type } = data;
      const [nx, ny, nz] = position;
      
      // Track as most recent activity
      mostRecentNodeId.current = id;
      lastActiveNodePos.current = new THREE.Vector3(nx, ny, nz);
      lastEventTime.current = Date.now();

      if (!autoFocus) {
        // Only run default randomized entry patterns if Auto-Focus is OFF
        targetLookAt.current.set(nx, ny, nz);

        // Randomly choose an animation pattern
        const patterns: ('orbit' | 'zoom' | 'fly')[] = ['orbit', 'zoom', 'fly'];
        animType.current = patterns[Math.floor(Math.random() * patterns.length)];

        if (animType.current === 'zoom') {
          // Zoom in close to the new node from current relative angle
          targetCamPos.current.set(nx, ny, nz + 6);
        } else if (animType.current === 'fly') {
          // Swoop in from an angle and depth
          targetCamPos.current.set(nx + 8, ny + 4, nz + 8);
        } else {
          // Orbit state: pull back a bit to see the local constellation
          targetCamPos.current.set(nx - 5, ny + 6, nz + 12);
        }

        eventBus.emit('debug-log', {
          message: `Camera animating (${animType.current}) to focus new ${type} Node.`,
          type: 'Debug',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Listen to stop limits for camera shakes & tracking
    const unsubscribeSl = eventBus.on('sl-limit', (data: any) => {
      lastSlTime.current = Date.now();
      if (data && data.nodeId) {
        mostRecentNodeId.current = data.nodeId;
        const currentNodes = useMindDataStore.getState().nodes;
        const found = currentNodes.find(n => n.id === data.nodeId);
        if (found) {
          lastActiveNodePos.current = new THREE.Vector3().fromArray(found.position);
          lastEventTime.current = Date.now();
        }
      }
    });

    // Listen to thought pulses for tracking activity
    const unsubscribeTp = eventBus.on('tp-pulse', (data: any) => {
      if (data && data.nodeId) {
        mostRecentNodeId.current = data.nodeId;
        const currentNodes = useMindDataStore.getState().nodes;
        const found = currentNodes.find(n => n.id === data.nodeId);
        if (found) {
          lastActiveNodePos.current = new THREE.Vector3().fromArray(found.position);
          lastEventTime.current = Date.now();
        }
      }
    });

    return () => {
      unsubscribeNode();
      unsubscribeSl();
      unsubscribeTp();
    };
  }, [autoFocus]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const now = Date.now();

    if (autoFocus) {
      // Dynamic updates: find current node position in case of moving updates
      if (mostRecentNodeId.current) {
        const found = nodes.find(n => n.id === mostRecentNodeId.current);
        if (found) {
          lastActiveNodePos.current = new THREE.Vector3().fromArray(found.position);
        }
      }

      if (lastActiveNodePos.current) {
        // Smoothly pan camera target to the focused node position
        targetLookAt.current.copy(lastActiveNodePos.current);

        // Constant orbiting around the focused node
        const radius = 9; // Focus range
        const speed = 0.35; // Majestic slow orbit
        const angle = time * speed;
        
        // Rotating camera path around the targeted node with fluctuating height
        const tx = lastActiveNodePos.current.x + Math.sin(angle) * radius;
        const tz = lastActiveNodePos.current.z + Math.cos(angle) * radius;
        const ty = lastActiveNodePos.current.y + Math.sin(time * 0.15) * 2;

        targetCamPos.current.set(tx, ty, tz);
      }
    } else {
      // Default camera movement
      const idleTime = now - lastEventTime.current;
      if (idleTime > 6000) {
        // Idle orbiting: gently orbit around the cluster
        const radius = 22;
        const speed = 0.08;
        const angle = time * speed;
        const tx = targetLookAt.current.x + Math.sin(angle) * radius;
        const tz = targetLookAt.current.z + Math.cos(angle) * radius;
        const ty = targetLookAt.current.y + Math.sin(time * 0.1) * 3;

        targetCamPos.current.set(tx, ty, tz);
      }
    }

    // Smoothly interpolate camera lookAt and position
    camera.position.lerp(targetCamPos.current, 0.04);
    currentLookAt.current.lerp(targetLookAt.current, 0.04);
    camera.lookAt(currentLookAt.current);

    // Shake effect on SL safety limits
    const slAge = now - lastSlTime.current;
    if (slAge < 1500) {
      // Shakes decays exponentially
      const intensity = 0.8 * Math.exp(-slAge / 400);
      camera.position.x += (Math.random() - 0.5) * intensity;
      camera.position.y += (Math.random() - 0.5) * intensity;
      camera.position.z += (Math.random() - 0.5) * intensity;
    }
  });

  return null;
}

// Node Render item with scale actions
interface NodeItemProps {
  node: MindNode;
  activeNodeId: string | null;
  setActiveNode: (n: MindNode | null) => void;
}

function NodeItem({ node, activeNodeId, setActiveNode }: NodeItemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [lastPulse, setLastPulse] = useState(0);
  const [lastSlPulse, setLastSlPulse] = useState(0);

  useEffect(() => {
    const unsubTp = eventBus.on('tp-pulse', (data) => {
      if (data.nodeId === node.id || (node.type === 'TP' && Math.random() > 0.5)) {
        setLastPulse(Date.now());
      }
    });

    const unsubSl = eventBus.on('sl-limit', (data) => {
      if (node.type === 'SL' || Math.random() > 0.7) {
        setLastSlPulse(Date.now());
      }
    });

    return () => {
      unsubTp();
      unsubSl();
    };
  }, [node]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const now = Date.now();

    // 1. Calculate dynamic scale (shrink/fade Debug after 10s, scale-in Chat)
    const ageMs = now - new Date(node.createdAt).getTime();
    const ageSecs = ageMs / 1000;
    let baseScale = 1.0;

    if (node.type === 'Debug') {
      // Quick scale-in (0s to 1s), full size (1s to 7s), shrink-out (7s to 10s)
      if (ageSecs < 1) {
        baseScale = ageSecs;
      } else if (ageSecs >= 7 && ageSecs < 10) {
        baseScale = 1.0 - (ageSecs - 7) / 3;
      } else if (ageSecs >= 10) {
        baseScale = 0.0;
      }
    } else if (node.type === 'Chat') {
      // Growing animation
      if (ageSecs < 1.2) {
        baseScale = Math.sin((ageSecs / 1.2) * Math.PI / 2);
      }
    }

    // 2. Pulse effect for TP nodes
    let tpPulseScale = 1.0;
    if (node.type === 'TP') {
      const pulseAge = now - lastPulse;
      if (pulseAge < 1200) {
        // High frequency pulse decays over 1.2s
        tpPulseScale = 1.0 + Math.sin((pulseAge / 100) * Math.PI) * 0.35 * Math.exp(-pulseAge / 400);
      }
    }

    // 3. Flash effect for SL nodes
    let flashScale = 1.0;
    if (node.type === 'SL') {
      const slAge = now - lastSlPulse;
      if (slAge < 1500) {
        flashScale = 1.0 + Math.sin(time * 25) * 0.25;
      }
    }

    // Hover scales slightly larger
    const hoverScale = hovered ? 1.3 : 1.0;
    const activeScale = activeNodeId === node.id ? 1.4 : 1.0;

    const finalScale = baseScale * tpPulseScale * flashScale * hoverScale * activeScale;
    meshRef.current.scale.setScalar(finalScale);

    // Rotate node gently
    meshRef.current.rotation.y = time * 0.5;
    meshRef.current.rotation.x = time * 0.3;
  });

  // Emissive color calculations for flash
  const emissiveColor = useMemo(() => {
    if (node.type === 'SL') return '#ff3333';
    if (node.type === 'TP') return '#33ff33';
    if (node.type === 'Chat') return '#3399ff';
    if (node.type === 'Media') return '#ff33ff';
    return '#aaaaaa';
  }, [node]);

  return (
    <mesh
      ref={meshRef}
      position={node.position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); setActiveNode(node); }}
    >
      <sphereGeometry args={[node.type === 'TP' || node.type === 'SL' ? 0.9 : 0.65, 32, 32]} />
      <meshStandardMaterial
        color={node.color}
        emissive={new THREE.Color(emissiveColor)}
        emissiveIntensity={hovered ? 1.8 : 0.8}
        roughness={0.1}
        metalness={0.8}
      />
      
      {/* 3D HTML Node Label */}
      <Html
        distanceFactor={12}
        position={[0, 1.2, 0]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div className={`px-2 py-0.5 rounded-md border text-xs font-mono whitespace-nowrap select-none transition-all duration-300 ${
          hovered || activeNodeId === node.id 
            ? 'bg-slate-900/90 border-blue-500 text-blue-400 scale-105 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
            : 'bg-black/75 border-slate-700/60 text-slate-300'
        }`}>
          {node.label.length > 25 ? `${node.label.slice(0, 25)}...` : node.label}
        </div>
      </Html>
    </mesh>
  );
}

interface ConnectionLineProps {
  fromPosition: [number, number, number];
  toPosition: [number, number, number];
  color: string;
}

function ConnectionLine({ fromPosition, toPosition, color }: ConnectionLineProps) {
  const packet1Ref = useRef<THREE.Mesh>(null);
  const packet2Ref = useRef<THREE.Mesh>(null);

  const fromVec = useMemo(() => new THREE.Vector3().fromArray(fromPosition), [fromPosition]);
  const toVec = useMemo(() => new THREE.Vector3().fromArray(toPosition), [toPosition]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speed = 0.35; // Majestic slow flow pacing
    
    // Packet 1 progress: flowing from fromNode to toNode
    const progress1 = (time * speed) % 1.0;
    if (packet1Ref.current) {
      packet1Ref.current.position.lerpVectors(fromVec, toVec, progress1);
      // Subtle organic heartbeat pulse
      const scale1 = 1.0 + Math.sin(time * 12) * 0.15;
      packet1Ref.current.scale.setScalar(scale1);
    }

    // Packet 2 progress: staggered by a phase offset of 0.5
    const progress2 = (time * speed + 0.5) % 1.0;
    if (packet2Ref.current) {
      packet2Ref.current.position.lerpVectors(fromVec, toVec, progress2);
      const scale2 = 1.0 + Math.cos(time * 12) * 0.15;
      packet2Ref.current.scale.setScalar(scale2);
    }
  });

  return (
    <group>
      {/* Structural support line (lower visibility) */}
      <Line
        points={[fromPosition, toPosition]}
        color={color}
        lineWidth={1.5}
        transparent
        opacity={0.3}
      />
      {/* Active transmission line highlight (higher visibility) */}
      <Line
        points={[fromPosition, toPosition]}
        color={color}
        lineWidth={2.2}
        transparent
        opacity={0.6}
      />
      
      {/* Transmission data flow packets */}
      <mesh ref={packet1Ref}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <mesh ref={packet2Ref}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// Complete 3D canvas viewer
interface MindCloud3DProps {
  onNodeClick: (node: MindNode | null) => void;
  activeNode: MindNode | null;
}

export default function MindCloud3D({ onNodeClick, activeNode }: MindCloud3DProps) {
  const nodes = useMindDataStore((state) => state.nodes);
  const connections = useMindDataStore((state) => state.connections);
  const [autoFocus, setAutoFocus] = useState(true);
  const [telemetryTick, setTelemetryTick] = useState(0);

  const activeNodeId = activeNode ? activeNode.id : null;

  // Real-time ticking jitter generator for visual ping fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryTick(t => t + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Compute active connections and average data transmission latency based on active WebGL coordinates
  const networkStats = useMemo(() => {
    let activeCount = 0;
    let totalLatency = 0;

    connections.forEach((conn) => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) return;

      const now = Date.now();
      if (fromNode.type === 'Debug') {
        const ageSecs = (now - new Date(fromNode.createdAt).getTime()) / 1000;
        if (ageSecs >= 10) return;
      }
      if (toNode.type === 'Debug') {
        const ageSecs = (now - new Date(toNode.createdAt).getTime()) / 1000;
        if (ageSecs >= 10) return;
      }

      activeCount++;

      // Compute Euclidean distance in 3D WebGL space
      const dx = fromNode.position[0] - toNode.position[0];
      const dy = fromNode.position[1] - toNode.position[1];
      const dz = fromNode.position[2] - toNode.position[2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Latency: 15ms overhead + 6.8ms per coordinate distance unit
      const latency = 15 + distance * 6.8;
      totalLatency += latency;
    });

    const averageLatency = activeCount > 0 ? totalLatency / activeCount : 0;
    
    // Ambient micro fluctuation to emulate real packet jitter
    const jitter = activeCount > 0 ? (Math.sin(telemetryTick) * 1.4 + Math.cos(telemetryTick * 0.6) * 0.7) : 0;
    const finalAvgLatency = averageLatency > 0 ? Math.max(5.0, averageLatency + jitter) : 0;

    return {
      activeCount,
      averageLatency: finalAvgLatency
    };
  }, [connections, nodes, telemetryTick]);

  // Render lines with depth & animation
  const renderedConnections = useMemo(() => {
    const items: React.ReactNode[] = [];
    connections.forEach((conn, index) => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) return;

      // Filter out connection lines where one of the nodes is a Debug node that faded out completely
      const now = Date.now();
      if (fromNode.type === 'Debug') {
        const ageSecs = (now - new Date(fromNode.createdAt).getTime()) / 1000;
        if (ageSecs >= 10) return;
      }
      if (toNode.type === 'Debug') {
        const ageSecs = (now - new Date(toNode.createdAt).getTime()) / 1000;
        if (ageSecs >= 10) return;
      }

      // Render a flowing transmission connection
      items.push(
        <ConnectionLine
          key={`${conn.from}-${conn.to}-${index}`}
          fromPosition={fromNode.position}
          toPosition={toNode.position}
          color={fromNode.color}
        />
      );
    });
    return items;
  }, [connections, nodes]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 backdrop-blur-md">
      {/* Network Telemetry Summary Panel */}
      <div className="absolute top-4 right-4 z-10 select-none flex flex-col gap-3 font-mono text-xs text-slate-300 bg-black/75 p-3.5 rounded-lg border border-slate-800/80 shadow-lg pointer-events-auto w-60">
        <div className="flex flex-col gap-1">
          <span className="text-blue-400 font-bold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-pulse-slow" />📡 NETWORK STATUS TELEMETRY
          </span>
          <span className="text-[10px] text-slate-500">Live WebGL Transmission Analytics</span>
        </div>

        <div className="border-t border-slate-800/80 my-0.5" />

        <div className="flex flex-col gap-2.5">
          {/* Active Connections */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-blue-500" />
              Active Links:
            </span>
            <span className="text-white font-bold text-sm">
              {networkStats.activeCount}
            </span>
          </div>

          {/* Average Latency */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 ${networkStats.activeCount > 0 ? 'text-yellow-400 animate-pulse' : 'text-slate-600'}`} />
              Avg Latency:
            </span>
            <span className={`font-bold text-sm ${networkStats.activeCount > 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
              {networkStats.activeCount > 0 ? `${networkStats.averageLatency.toFixed(1)} ms` : '0.0 ms (Standby)'}
            </span>
          </div>

          <div className="border-t border-slate-800/80 my-0.5" />

          {/* Physical Link Status */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500">LINK STATUS</span>
              <span className={`font-semibold ${networkStats.activeCount > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                {networkStats.activeCount > 0 ? 'NOMINAL / STABLE' : 'SLEEP / INACTIVE'}
              </span>
            </div>
            {/* Visual signal strength bars */}
            <div className="flex gap-1 h-1.5 w-full bg-slate-900 rounded overflow-hidden mt-0.5">
              <div className={`h-full rounded-sm transition-all duration-500 ${networkStats.activeCount > 0 ? 'w-[85%] bg-green-500/80' : 'w-0 bg-slate-800'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Interaction Instruction Overlay & Auto-Focus Controls */}
      <div className="absolute top-4 left-4 z-10 select-none flex flex-col gap-3 font-mono text-xs text-slate-400 bg-black/75 p-3.5 rounded-lg border border-slate-800/80 shadow-lg pointer-events-auto">
        <div className="flex flex-col gap-1">
          <span className="text-blue-400 font-bold flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />📡 MIND CLOUD NAVIGATION
          </span>
          <span>• Nodes auto-spiral from center</span>
          <span>• White nodes shrink after 10s</span>
          <span>• Click nodes to inspect payload</span>
        </div>

        <div className="border-t border-slate-800/80 my-0.5" />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Target className={`w-3.5 h-3.5 ${autoFocus ? 'text-green-400 animate-pulse' : 'text-slate-500'}`} />
              Auto-Focus Mode
            </span>
            <button
              onClick={() => {
                setAutoFocus(!autoFocus);
                eventBus.emit('debug-log', {
                  message: `User toggled Auto-Focus to ${!autoFocus ? 'ENABLED' : 'DISABLED'}.`,
                  type: 'Debug',
                  timestamp: new Date().toISOString()
                });
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                autoFocus 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30' 
                  : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
              }`}
            >
              {autoFocus ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
          <span className="text-[10px] text-slate-500 leading-relaxed max-w-[180px]">
            {autoFocus 
              ? 'Automatically rotates/centers camera on the most recent active node.' 
              : 'Allows manual exploration and normal ambient orbit.'}
          </span>
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 0, 22], fov: 60 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={['#020205']} />
        
        {/* Immersive ambient starfield layers */}
        <SpaceBackground />

        {/* Studio Lights */}
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 15, 15]} intensity={2.5} />
        <pointLight position={[-10, -15, -15]} intensity={1.5} />

        {/* Renders all nodes */}
        {nodes.map((node) => (
          <NodeItem
            key={node.id}
            node={node}
            activeNodeId={activeNodeId}
            setActiveNode={onNodeClick}
          />
        ))}

        {/* Connective network lines */}
        {renderedConnections}

        {/* Advanced Motion trails & Unreal bloom effect */}
        <PostProcessing />

        {/* Camera automation system */}
        <CameraController autoFocus={autoFocus} activeNode={activeNode} />
      </Canvas>
    </div>
  );
}
