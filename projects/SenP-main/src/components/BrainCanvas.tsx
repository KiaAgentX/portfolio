import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { NeuronNodeData, SynapseLink, CameraShotType, ConsciousnessState, NeuralBurstEvent, NeuronCustomization, SynapticPathfindingEvent } from "../types";
import { getDnaForIndex, DNA_TYPES } from "../data/dna";
import { playSpawnSound, playPulseSound } from "../utils/audio";
import { Camera, Zap, Orbit, ZoomIn, Eye, Compass, RefreshCw, Flame, Sparkles, Pin } from "lucide-react";

interface BrainCanvasProps {
  nodes: NeuronNodeData[];
  links: SynapseLink[];
  onNodeClick?: (node: NeuronNodeData) => void;
  onNodeHover?: (node: NeuronNodeData | null) => void;
  cameraShot?: CameraShotType | null;
  consciousness?: ConsciousnessState;
  soundFxEnabled?: boolean;
  neuralBurst?: NeuralBurstEvent | null;
  synapticPathfinding?: SynapticPathfindingEvent | null;
  onTriggerCameraShot?: (shot: CameraShotType) => void;
  onTestNeuralBurst?: () => void;
  onTestSynapticPathfinding?: () => void;
  isSupporter?: boolean;
  onOrbitalReconfigure?: (node: NeuronNodeData, ringName: string, priority: string) => void;
  onZenOrbitChange?: (active: boolean) => void;
  neuronCustomization?: NeuronCustomization;
  adaptiveGeometryMode?: boolean;
  onAdaptiveGeometryChange?: (active: boolean) => void;
  latestTokenCount?: number;
  isStreaming?: boolean;
  completionTokensCount?: number;
  neuralDecayMode?: boolean;
  onTogglePinNode?: (nodeId: string) => void;
  onNodePositionChange?: (nodeId: string, x: number, y: number, z: number) => void;
  onClusterRotateModeChange?: (active: boolean) => void;
  isHeatmapActive?: boolean;
  isClusterByDnaActive?: boolean;
  searchQuery?: string;
  isFocusModeActive?: boolean;
  isGameModeActive?: boolean;
  onToggleGameMode?: () => void;
  isCortexCityActive?: boolean;
  totalTokens?: number;
  activeTabId?: string;
  activeMessageIds?: string[];
}

export const BrainCanvas: React.FC<BrainCanvasProps> = ({
  nodes,
  links,
  onNodeClick,
  onNodeHover,
  cameraShot,
  consciousness = "idle",
  soundFxEnabled = true,
  neuralBurst = null,
  synapticPathfinding = null,
  onTriggerCameraShot,
  onTestNeuralBurst,
  onTestSynapticPathfinding,
  isSupporter = false,
  onOrbitalReconfigure,
  onZenOrbitChange,
  neuronCustomization,
  adaptiveGeometryMode = false,
  onAdaptiveGeometryChange,
  latestTokenCount = 0,
  isStreaming = false,
  completionTokensCount = 0,
  neuralDecayMode = false,
  onTogglePinNode,
  onNodePositionChange,
  onClusterRotateModeChange,
  isHeatmapActive = false,
  isClusterByDnaActive = false,
  searchQuery = "",
  isFocusModeActive = false,
  isGameModeActive = false,
  onToggleGameMode,
  isCortexCityActive = true,
  totalTokens = 0,
  activeTabId = "",
  activeMessageIds = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cosmicGroupRef = useRef<THREE.Group | null>(null);
  const nodeMeshesRef = useRef<Map<string, { mesh: THREE.Mesh; ring: THREE.Mesh; data: NeuronNodeData; shape?: string; baseSize?: number }>>(new Map());
  const linkLinesRef = useRef<THREE.LineSegments[]>([]);
  const burstParticlesRef = useRef<THREE.Points | null>(null);
  const burstPulseRef = useRef<THREE.Mesh | null>(null);
  const pathfindingGroupRef = useRef<THREE.Group | null>(null);
  const pathfindingBeadsRef = useRef<THREE.Mesh[]>([]);
  const pathfindingCurveRef = useRef<THREE.QuadraticBezierCurve3 | null>(null);
  const neuralBurstRef = useRef(neuralBurst);
  const synapticPathfindingRef = useRef(synapticPathfinding);
  const consciousnessRef = useRef(consciousness);

  useEffect(() => {
    neuralBurstRef.current = neuralBurst;
  }, [neuralBurst]);
  useEffect(() => {
    synapticPathfindingRef.current = synapticPathfinding;
  }, [synapticPathfinding]);
  useEffect(() => {
    consciousnessRef.current = consciousness;
  }, [consciousness]);

  const [zenOrbitActive, setZenOrbitActive] = useState(false);
  const [localAdaptiveMode, setLocalAdaptiveMode] = useState(false);
  const isAdaptiveActive = localAdaptiveMode || adaptiveGeometryMode || neuronCustomization?.geometryShape === "adaptive" || neuronCustomization?.adaptiveGeometry || false;

  const [localNeuralDecayMode, setLocalNeuralDecayMode] = useState(false);
  const isNeuralDecayActive = localNeuralDecayMode || neuralDecayMode || false;

  const [clusterRotateMode, setClusterRotateMode] = useState(false);
  const [isRotatingCluster, setIsRotatingCluster] = useState(false);
  const [hasRotatedAxis, setHasRotatedAxis] = useState(false);
  const [isGhostPovPinned, setIsGhostPovPinned] = useState(true);
  const clusterRotateModeRef = useRef(clusterRotateMode);
  const isRotatingClusterRef = useRef(isRotatingCluster);
  const isHeatmapActiveRef = useRef(isHeatmapActive);
  const isClusterByDnaActiveRef = useRef(isClusterByDnaActive);
  const searchQueryRef = useRef(searchQuery);
  const isFocusModeActiveRef = useRef(isFocusModeActive);
  const isGameModeActiveRef = useRef(isGameModeActive);
  const onToggleGameModeRef = useRef(onToggleGameMode);
  const isCortexCityActiveRef = useRef(isCortexCityActive);
  const totalTokensRef = useRef(totalTokens);
  const activeTabIdRef = useRef(activeTabId);
  const activeMessageIdsRef = useRef(new Set(activeMessageIds));

  useEffect(() => {
    clusterRotateModeRef.current = clusterRotateMode;
    isRotatingClusterRef.current = isRotatingCluster;
  }, [clusterRotateMode, isRotatingCluster]);

  useEffect(() => {
    const wasFocus = isFocusModeActiveRef.current;
    const wasGame = isGameModeActiveRef.current;
    isHeatmapActiveRef.current = isHeatmapActive;
    isClusterByDnaActiveRef.current = isClusterByDnaActive;
    searchQueryRef.current = searchQuery;
    isFocusModeActiveRef.current = isFocusModeActive;
    isGameModeActiveRef.current = isGameModeActive;
    onToggleGameModeRef.current = onToggleGameMode;
    isCortexCityActiveRef.current = isCortexCityActive;
    totalTokensRef.current = totalTokens;
    activeTabIdRef.current = activeTabId;
    activeMessageIdsRef.current = new Set(activeMessageIds || []);

    if (!wasGame && isGameModeActive && cameraRef.current) {
      gamePositionRef.current.copy(cameraRef.current.position);
      gameRotationRef.current.yaw = orbitRef.current.theta;
      gameRotationRef.current.pitch = 0;
    }

    if (!wasFocus && isFocusModeActive && orbitRef.current) {
      orbitRef.current.autoRotate = false;
      orbitRef.current.cinematicActive = true;
      const startRadius = orbitRef.current.radius;
      const startPhi = orbitRef.current.phi;
      const startTheta = orbitRef.current.theta;
      const targetRadius = Math.max(8.5, startRadius * 0.72);
      const targetPhi = Math.PI / 2 - 0.12;
      const targetTheta = startTheta + 0.6;

      const startTime = performance.now();
      const duration = 1200;
      let frameId: number;
      const tween = (now: number) => {
        const p = Math.min((now - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        orbitRef.current.radius = startRadius + (targetRadius - startRadius) * ease;
        orbitRef.current.phi = startPhi + (targetPhi - startPhi) * ease;
        orbitRef.current.theta = startTheta + (targetTheta - startTheta) * ease;
        if (p < 1) frameId = requestAnimationFrame(tween);
        else orbitRef.current.cinematicActive = false;
      };
      requestAnimationFrame(tween);
    }
  }, [isHeatmapActive, isClusterByDnaActive, searchQuery, isFocusModeActive, activeTabId, activeMessageIds]);

  const [pinnedNodes, setPinnedNodes] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("senpai_neural_pinned_v1");
      if (saved) return new Set(JSON.parse(saved));
    } catch (_) {}
    return new Set(["seed-0", "seed-core", "seed-ui", "seed-db"]);
  });

  const togglePinNode = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPinnedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      try {
        localStorage.setItem("senpai_neural_pinned_v1", JSON.stringify(Array.from(next)));
      } catch (_) {}
      return next;
    });
    onTogglePinNode?.(nodeId);
    playPulseSound(soundFxEnabled);
  };

  const activeTokens = (latestTokenCount && latestTokenCount > 0) ? latestTokenCount : (neuralBurst?.tokenCount || 350);
  const tokenIntensity = Math.min(2.0, Math.max(0.15, activeTokens / 500));

  const adaptiveModeRef = useRef(isAdaptiveActive);
  const tokenIntensityRef = useRef(tokenIntensity);
  const latestTokensRef = useRef(activeTokens);
  const neuralDecayRef = useRef(isNeuralDecayActive);
  const isStreamingRef = useRef(isStreaming || consciousness === "speaking" || consciousness === "agent-processing");
  const completionTokensRef = useRef(completionTokensCount || activeTokens);
  const pinnedNodesRef = useRef(pinnedNodes);

  useEffect(() => {
    adaptiveModeRef.current = isAdaptiveActive;
    tokenIntensityRef.current = tokenIntensity;
    latestTokensRef.current = activeTokens;
    neuralDecayRef.current = isNeuralDecayActive;
    isStreamingRef.current = isStreaming || consciousness === "speaking" || consciousness === "agent-processing";
    completionTokensRef.current = completionTokensCount || activeTokens;
    pinnedNodesRef.current = pinnedNodes;
  }, [isAdaptiveActive, tokenIntensity, activeTokens, isNeuralDecayActive, isStreaming, consciousness, completionTokensCount, pinnedNodes]);

  const setAdaptiveGeometryState = (active: boolean) => {
    setLocalAdaptiveMode(active);
    onAdaptiveGeometryChange?.(active);
  };

  const zenOrbitRef = useRef(false);
  const lastInteractionRef = useRef(performance.now());
  const zenOrbitGraceRef = useRef(0);

  // Orbit state
  const orbitRef = useRef({
    theta: 0,
    phi: Math.PI / 2,
    radius: 16,
    isDragging: false,
    autoRotate: false,
    prevMouse: { x: 0, y: 0 },
    cinematicActive: false,
    isDraggingNode: false,
    isRotatingCluster: false,
    draggedNode: null as NeuronNodeData | null,
    dragPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
  });

  const setZenOrbitState = (active: boolean) => {
    if (zenOrbitRef.current !== active) {
      zenOrbitRef.current = active;
      setZenOrbitActive(active);
      onZenOrbitChange?.(active);
      if (active) {
        zenOrbitGraceRef.current = performance.now() + 2000;
        orbitRef.current.autoRotate = true;
      } else {
        orbitRef.current.autoRotate = false;
      }
    }
  };

  const [hoveredNode, setHoveredNode] = useState<NeuronNodeData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const gameKeysRef = useRef<Record<string, boolean>>({});
  const gamePositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2, 16));
  const gameRotationRef = useRef<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });
  const cortexCityGroupRef = useRef<THREE.Group | null>(null);
  const npcGroupRef = useRef<THREE.Group | null>(null);
  const npcDronesRef = useRef<Array<{ mesh: THREE.Group; targetNode: any; laser: THREE.Line; speed: number; angle: number; radius: number; yOffset: number; name: string }>>([]);
  const cityBuildingsRef = useRef<Array<{ mesh: THREE.Mesh; height: number; targetHeight: number; tokenThreshold: number }>>([]);

  const getAdaptiveShapeForNode = (tokens: number, index: number, role: string, defaultShape: string): string => {
    const tier = Math.floor(tokens / 220); // 0: <220, 1: 220-440, 2: 440-660, 3: >=660
    if (role === "ai") {
      return tier >= 3 ? "starburst" : tier === 2 ? "torusknot" : tier === 1 ? "dodecahedron" : "octahedron";
    }
    const tierShapes: Record<number, string[]> = {
      0: ["sphere", "icosahedron", "octahedron"], // Low token intensity: foundational solids
      1: ["dodecahedron", "torus", "cylinder", "octahedron"], // Moderate token intensity: multi-faceted
      2: ["torusknot", "cone", "dodecahedron", "starburst"], // High token intensity: neural loops & spikes
      3: ["starburst", "torusknot", "tetrahedron", "icosahedron"], // Extreme burst intensity: radiant excitation
    };
    const list = tierShapes[Math.min(3, tier)] || tierShapes[1];
    return list[index % list.length] || defaultShape;
  };

  // Helper to create geometry by DNA shape or adaptive geometry mode
  const createGeometryForShape = (shape: string, size: number): THREE.BufferGeometry => {
    const normalized = shape ? shape.toLowerCase() : "cube";
    switch (normalized) {
      case "sphere":
        return new THREE.SphereGeometry(size, 16, 16);
      case "icosahedron":
        return new THREE.IcosahedronGeometry(size, 0);
      case "octahedron":
        return new THREE.OctahedronGeometry(size, 0);
      case "tetrahedron":
        return new THREE.TetrahedronGeometry(size, 0);
      case "torus":
        return new THREE.TorusGeometry(size * 0.75, size * 0.3, 8, 16);
      case "dodecahedron":
        return new THREE.DodecahedronGeometry(size, 0);
      case "cone":
        return new THREE.ConeGeometry(size * 0.85, size * 1.6, 8);
      case "torusknot":
      case "torus_knot":
        return new THREE.TorusKnotGeometry(size * 0.6, size * 0.2, 40, 8);
      case "cylinder":
        return new THREE.CylinderGeometry(size * 0.75, size * 0.75, size * 1.4, 8);
      case "starburst": {
        const geo = new THREE.OctahedronGeometry(size * 1.25, 1);
        const pos = geo.getAttribute("position");
        if (pos) {
          for (let i = 0; i < pos.count; i++) {
            const v = new THREE.Vector3().fromBufferAttribute(pos, i);
            if (i % 2 === 0) v.multiplyScalar(1.55);
            pos.setXYZ(i, v.x, v.y, v.z);
          }
          geo.computeVertexNormals();
        }
        return geo;
      }
      case "cube":
      default:
        return new THREE.BoxGeometry(size * 1.3, size * 1.3, size * 1.3);
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x020617, 0.003);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 16);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const isMobileOrTablet = typeof window !== "undefined" && (window.innerWidth < 1024 || "ontouchstart" in window || navigator.maxTouchPoints > 0);
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobileOrTablet, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileOrTablet ? 1.25 : 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const cosmicGroup = new THREE.Group();
    scene.add(cosmicGroup);
    cosmicGroupRef.current = cosmicGroup;

    // Lights
    const ambient = new THREE.AmbientLight(0x1a2639, 0.6);
    scene.add(ambient);
    const pointLight = new THREE.PointLight(0x00d4ff, 2, 35);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    const purpleLight = new THREE.PointLight(0xb565ff, 1.5, 30);
    purpleLight.position.set(-5, -5, 3);
    scene.add(purpleLight);

    // Black Hole Core
    const bhGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const bhMesh = new THREE.Mesh(bhGeo, bhMat);
    cosmicGroup.add(bhMesh);

    // Accretion Disk
    const diskGeo = new THREE.RingGeometry(1.0, 2.2, 64);
    const diskMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const diskMesh = new THREE.Mesh(diskGeo, diskMat);
    diskMesh.rotation.x = Math.PI / 3;
    diskMesh.rotation.z = 0.2;
    cosmicGroup.add(diskMesh);

    // Atom / Nebula Cloud (Enhanced deep space cloud)
    const atomCount = 2600;
    const atomGeo = new THREE.BufferGeometry();
    const atomPositions = new Float32Array(atomCount * 3);
    const atomColors = new Float32Array(atomCount * 3);
    for (let i = 0; i < atomCount; i++) {
      const r = 2.0 + Math.random() * 11.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      atomPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      atomPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65;
      atomPositions[i * 3 + 2] = r * Math.cos(phi);

      const randColor = Math.random();
      const col = randColor < 0.4
        ? new THREE.Color(0x00d4ff).lerp(new THREE.Color(0xb565ff), Math.random())
        : new THREE.Color(0x7928ca).lerp(new THREE.Color(0xff007f), Math.random());
      atomColors[i * 3] = col.r;
      atomColors[i * 3 + 1] = col.g;
      atomColors[i * 3 + 2] = col.b;
    }
    atomGeo.setAttribute("position", new THREE.BufferAttribute(atomPositions, 3));
    atomGeo.setAttribute("color", new THREE.BufferAttribute(atomColors, 3));
    const atomMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const atomCloud = new THREE.Points(atomGeo, atomMat);
    cosmicGroup.add(atomCloud);

    // Layer 1: Distant Deep Space Starfield
    const distantStarCount = 2400;
    const distantStarPos = new Float32Array(distantStarCount * 3);
    for (let i = 0; i < distantStarCount * 3; i++) distantStarPos[i] = (Math.random() - 0.5) * 90;
    const distantStarGeo = new THREE.BufferGeometry();
    distantStarGeo.setAttribute("position", new THREE.BufferAttribute(distantStarPos, 3));
    const distantStarMat = new THREE.PointsMaterial({
      color: 0x4466aa,
      size: 0.045,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const distantStarField = new THREE.Points(distantStarGeo, distantStarMat);
    scene.add(distantStarField);

    // Layer 2: Bright Glowing Stars
    const brightStarCount = 600;
    const brightStarPos = new Float32Array(brightStarCount * 3);
    const brightStarColors = new Float32Array(brightStarCount * 3);
    for (let i = 0; i < brightStarCount; i++) {
      brightStarPos[i * 3] = (Math.random() - 0.5) * 70;
      brightStarPos[i * 3 + 1] = (Math.random() - 0.5) * 70;
      brightStarPos[i * 3 + 2] = (Math.random() - 0.5) * 70;
      const c = new THREE.Color().setHSL(0.55 + Math.random() * 0.25, 0.8, 0.7);
      brightStarColors[i * 3] = c.r;
      brightStarColors[i * 3 + 1] = c.g;
      brightStarColors[i * 3 + 2] = c.b;
    }
    const brightStarGeo = new THREE.BufferGeometry();
    brightStarGeo.setAttribute("position", new THREE.BufferAttribute(brightStarPos, 3));
    brightStarGeo.setAttribute("color", new THREE.BufferAttribute(brightStarColors, 3));
    const brightStarMat = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const brightStarField = new THREE.Points(brightStarGeo, brightStarMat);
    scene.add(brightStarField);

    // Layer 3: Cosmic Nebula Dust Drift
    const dustCount = 1000;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i++) dustPos[i] = (Math.random() - 0.5) * 50;
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.12,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    });
    const dustField = new THREE.Points(dustGeo, dustMat);
    cosmicGroup.add(dustField);

    // Dynamic Shooting Stars / Meteor Streaks
    const meteors: { line: THREE.Line; speed: number; reset: () => void }[] = [];
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(6);
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.75 });
      const line = new THREE.Line(geo, mat);
      scene.add(line);

      const reset = () => {
        const sx = (Math.random() - 0.5) * 60;
        const sy = 20 + Math.random() * 20;
        const sz = (Math.random() - 0.5) * 60;
        pos[0] = sx; pos[1] = sy; pos[2] = sz;
        pos[3] = sx - 3.5; pos[4] = sy + 3.5; pos[5] = sz - 1.5;
        geo.attributes.position.needsUpdate = true;
      };
      reset();
      meteors.push({ line, speed: 0.7 + Math.random() * 0.9, reset });
    }

    // Neural Burst Synaptic Swarm (350 photon particles)
    const swarmCount = 350;
    const swarmPos = new Float32Array(swarmCount * 3);
    const swarmColors = new Float32Array(swarmCount * 3);
    for (let i = 0; i < swarmCount; i++) {
      swarmPos[i * 3] = (Math.random() - 0.5) * 4;
      swarmPos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      swarmPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      swarmColors[i * 3] = 0.0;
      swarmColors[i * 3 + 1] = 1.0;
      swarmColors[i * 3 + 2] = 1.0;
    }
    const swarmGeo = new THREE.BufferGeometry();
    swarmGeo.setAttribute("position", new THREE.BufferAttribute(swarmPos, 3));
    swarmGeo.setAttribute("color", new THREE.BufferAttribute(swarmColors, 3));
    const swarmMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    const swarmPoints = new THREE.Points(swarmGeo, swarmMat);
    cosmicGroup.add(swarmPoints);
    burstParticlesRef.current = swarmPoints;

    // Shockwave Sphere for Neural Burst
    const shockGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.0,
      wireframe: true,
      blending: THREE.AdditiveBlending,
    });
    const shockMesh = new THREE.Mesh(shockGeo, shockMat);
    cosmicGroup.add(shockMesh);
    burstPulseRef.current = shockMesh;

    // Cortex City & NPC Architects System ("Building City on Space with User Token")
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);
    cortexCityGroupRef.current = cityGroup;

    const npcGroup = new THREE.Group();
    scene.add(npcGroup);
    npcGroupRef.current = npcGroup;
    npcDronesRef.current = [];
    cityBuildingsRef.current = [];

    // Dyson Ring Base for City
    const baseRingGeo = new THREE.RingGeometry(24, 48, 64);
    const baseRingMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      wireframe: true,
    });
    const baseRingMesh = new THREE.Mesh(baseRingGeo, baseRingMat);
    baseRingMesh.rotation.x = Math.PI / 2;
    cityGroup.add(baseRingMesh);

    // Initial City Building Slots (Max 40 futuristic cyber towers in orbit)
    const maxBuildings = 40;
    for (let i = 0; i < maxBuildings; i++) {
      const angle = (i / maxBuildings) * Math.PI * 2 + (i % 2 === 0 ? 0 : 0.05);
      const radius = 26 + (i % 4) * 5 + Math.sin(i) * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const maxH = 4 + (i % 7) * 3 + Math.random() * 6;
      const bGeo = i % 3 === 0 ? new THREE.CylinderGeometry(0.8, 1.2, 1, 8) : new THREE.BoxGeometry(1.4, 1, 1.4);
      const bMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x0f172a : 0x1e1b4b,
        roughness: 0.2,
        metalness: 0.9,
        emissive: i % 3 === 0 ? 0x00ffff : i % 3 === 1 ? 0xa855f7 : 0xf43f5e,
        emissiveIntensity: 0.4,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(x, 0, z);

      // Add glowing neon edges
      const edges = new THREE.EdgesGeometry(bGeo);
      const edgeLine = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color: i % 3 === 0 ? 0x00ffff : i % 3 === 1 ? 0xc084fc : 0xf43f5e,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
        })
      );
      bMesh.add(edgeLine);

      // Floating data beacon over tower
      const beaconGeo = new THREE.OctahedronGeometry(0.3, 0);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.y = 2;
      bMesh.add(beaconMesh);

      bMesh.visible = false;
      cityGroup.add(bMesh);
      cityBuildingsRef.current.push({ mesh: bMesh as any, height: 0.1, targetHeight: maxH, tokenThreshold: i * 80 });
    }

    // Spawn 8 AI Architect NPC Drones ("NPC live In Cortex")
    const npcNames = [
      "NPC-01: Synapse Warden",
      "NPC-02: Token Architect",
      "NPC-03: Quantum Builder",
      "NPC-04: Neural Harvester",
      "NPC-05: Cortex Weaver",
      "NPC-06: Dyson Engineer",
      "NPC-07: Logic Sentry",
      "NPC-08: Nexus Drone",
    ];
    for (let i = 0; i < 8; i++) {
      const droneGroup = new THREE.Group();
      const coreGeo = new THREE.OctahedronGeometry(0.55, 1);
      const coreMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00ffff : 0xc084fc, wireframe: true });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      droneGroup.add(coreMesh);

      const ringGeo = new THREE.TorusGeometry(0.85, 0.05, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 3;
      droneGroup.add(ringMesh);

      const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]);
      const laserMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
      const laserLine = new THREE.Line(laserGeo, laserMat);
      scene.add(laserLine);

      npcGroup.add(droneGroup);
      npcDronesRef.current.push({
        mesh: droneGroup,
        targetNode: null,
        laser: laserLine,
        speed: 0.003 + i * 0.001,
        angle: (i / 8) * Math.PI * 2,
        radius: 12 + (i % 3) * 6,
        yOffset: i * 0.8,
        name: npcNames[i],
      });
    }

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();
    const frustum = new THREE.Frustum();
    const projScreenMatrix = new THREE.Matrix4();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Update camera frustum for culling & distance LOD
      camera.updateMatrixWorld();
      projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(projScreenMatrix);

      // Rotate cosmic elements & parallax starfields
      diskMesh.rotation.y += 0.006;
      atomCloud.rotation.y += 0.002;
      atomCloud.rotation.x = Math.sin(elapsed * 0.5) * 0.05;
      distantStarField.rotation.y += 0.0003;
      brightStarField.rotation.y -= 0.0005;
      dustField.rotation.y += 0.0012;
      dustField.rotation.z = Math.sin(elapsed * 0.3) * 0.08;

      brightStarMat.opacity = 0.55 + Math.sin(elapsed * 2.5) * 0.25;
      dustMat.opacity = 0.18 + Math.cos(elapsed * 1.8) * 0.1;

      // Animate shooting stars
      meteors.forEach((m) => {
        const pos = m.line.geometry.attributes.position as THREE.BufferAttribute;
        pos.setXYZ(0, pos.getX(0) - m.speed, pos.getY(0) - m.speed * 0.7, pos.getZ(0) - m.speed * 0.3);
        pos.setXYZ(1, pos.getX(1) - m.speed, pos.getY(1) - m.speed * 0.7, pos.getZ(1) - m.speed * 0.3);
        pos.needsUpdate = true;
        if (pos.getY(0) < -35) {
          m.reset();
        }
      });

      // Animate node rings & pulsing (with health data, Supporter Gold Aura, and Adaptive Geometry mode)
      nodeMeshesRef.current.forEach(({ mesh, ring, data }, id) => {
        // Frustum Culling & Distance LOD System
        const isCulled = !frustum.intersectsObject(mesh);
        const distSq = mesh.position.distanceToSquared(camera.position);
        const isTooFar = distSq > (isMobileOrTablet ? 1400 : 3500);

        if (isCulled || isTooFar) {
          mesh.visible = false;
          ring.visible = false;
          return; // Skip CPU vertex transformations and material lerping for culled nodes!
        }
        mesh.visible = true;
        // Distance LOD optimization: hide outer wireframe ring for distant nodes to reduce fill-rate & draw calls
        const hideRingLOD = distSq > (isMobileOrTablet ? 250 : 800);
        ring.visible = !hideRingLOD;

        ring.rotation.x += 0.02;
        ring.rotation.y += 0.03;
        const baseRingOpacity = isSupporter && (data.role === "ai" || data.strength > 75) ? 0.7 : 0.4;
        (ring.material as THREE.MeshBasicMaterial).opacity = baseRingOpacity + Math.sin(elapsed * 3 + mesh.position.x) * 0.25;
        
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const glowInt = neuronCustomization?.glowIntensity || 1.0;
        const customScale = neuronCustomization?.sizeScale || 1.0;
        const pulseRate = data.strength > 80 ? 4 : 2;

        if (adaptiveModeRef.current) {
          const intensity = tokenIntensityRef.current; // e.g. 0.15 to 2.0 based on latest token count
          mat.transparent = true;
          
          // Dynamic opacity modulation based on token intensity
          const waveFreq = 2.0 + intensity * 3.5;
          const waveAmp = Math.min(0.35, 0.15 * intensity);
          const centerOpacity = Math.min(0.9, 0.4 + intensity * 0.35);
          const dynamicOpacity = Math.min(1.0, Math.max(0.25, centerOpacity + Math.sin(elapsed * waveFreq + mesh.position.x * 0.8 + mesh.position.y * 0.5) * waveAmp));
          mat.opacity = dynamicOpacity;
          
          // Emissive intensity pulse powered by LLM response token count
          mat.emissiveIntensity = glowInt * (0.8 + intensity * 0.7 + Math.cos(elapsed * (3 + intensity) + mesh.position.z) * 0.35 * intensity);
          
          // Adaptive rotation and dynamic scale breathing
          mesh.rotation.x += 0.008 * intensity;
          mesh.rotation.y += 0.012 * intensity;
          mesh.rotation.z += 0.006 * intensity;
          
          const adaptiveRate = pulseRate * (1.0 + intensity * 0.4);
          const scalePulse = (1.0 + Math.sin(elapsed * adaptiveRate + mesh.position.y) * (0.08 + intensity * 0.14) * (data.strength / 100)) * customScale;
          mesh.scale.set(scalePulse, scalePulse, scalePulse);
        } else {
          if (mat.transparent && mat.opacity !== 1.0) {
            mat.transparent = false;
            mat.opacity = 1.0;
          }
          mat.emissiveIntensity = glowInt;
          const scalePulse = (1.0 + Math.sin(elapsed * pulseRate + mesh.position.y) * 0.08 * (data.strength / 100)) * customScale;
          mesh.scale.set(scalePulse, scalePulse, scalePulse);
        }

        // Neural Decay Mode: Older inactive neuron nodes slowly shrink and fade over time unless pinned
        if (neuralDecayRef.current) {
          const isPinned = data.pinned || data.role === "seed" || pinnedNodesRef.current.has(id) || id === hoveredNode?.id;
          if (!isPinned) {
            const ageSec = (Date.now() - (data.birthTime || Date.now())) / 1000;
            if (ageSec > 12) {
              const decay = Math.max(0.2, 1.0 - ((ageSec - 12) / 45));
              mat.transparent = true;
              mat.opacity = Math.max(0.15, (mat.opacity || 1.0) * decay);
              mesh.scale.multiplyScalar(decay);
              (ring.material as THREE.MeshBasicMaterial).opacity *= decay;
            }
          }
        }

        // 1. Search Locator Pulse: Highlight matches with golden pulse, dim non-matches
        const q = (searchQueryRef.current || "").toLowerCase().trim();
        if (q) {
          const isMatch = (data.keyword && data.keyword.toLowerCase().includes(q)) ||
                          (data.dnaType && data.dnaType.toLowerCase().includes(q)) ||
                          (data.id && data.id.toLowerCase().includes(q)) ||
                          (data.role && data.role.toLowerCase().includes(q));
          if (isMatch) {
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.emissive.setHex(0xffffff);
            mat.emissiveIntensity = 2.5 + Math.sin(elapsed * 12) * 1.5;
            const pulse = (1.4 + Math.sin(elapsed * 8) * 0.3) * customScale;
            mesh.scale.set(pulse, pulse, pulse);
            ring.visible = true;
            ring.scale.setScalar(1.5 + Math.sin(elapsed * 6) * 0.3);
          } else {
            mat.transparent = true;
            mat.opacity = 0.12;
            ring.visible = false;
          }
        }

        // 2. Neural Density Heatmap: Blue (low) -> Purple -> Red (high)
        if (isHeatmapActiveRef.current && !q) {
          if (!mesh.userData.origColor) {
            mesh.userData.origColor = mat.color.clone();
            mesh.userData.origEmissive = mat.emissive.clone();
          }
          const ratio = Math.min(1, Math.max(0, (data.strength - 40) / 60));
          const blueCol = new THREE.Color(0x3b82f6);
          const purpleCol = new THREE.Color(0xa855f7);
          const redCol = new THREE.Color(0xef4444);
          const targetCol = ratio < 0.5 ? blueCol.clone().lerp(purpleCol, ratio * 2) : purpleCol.clone().lerp(redCol, (ratio - 0.5) * 2);
          mat.color.copy(targetCol);
          mat.emissive.copy(targetCol);
          mat.emissiveIntensity = 1.2 + ratio * 1.5;
        } else if (!isHeatmapActiveRef.current && mesh.userData.origColor && !q) {
          mat.color.copy(mesh.userData.origColor);
          mat.emissive.copy(mesh.userData.origEmissive);
          delete mesh.userData.origColor;
          delete mesh.userData.origEmissive;
        }

        // 3. Cluster by DNA Archetype: Group neurons into specialized 3D sub-clusters
        if (isClusterByDnaActiveRef.current && !orbitRef.current.isDraggingNode) {
          const dnaIdx = DNA_TYPES.findIndex((d: any) => d.name.toLowerCase() === (data.dnaType || "").toLowerCase() || d.id.toLowerCase() === (data.dnaType || "").toLowerCase());
          const validIdx = dnaIdx >= 0 ? dnaIdx : (Math.abs(id.charCodeAt(0) || 0) % 10);
          const clusterAngle = (validIdx / 10) * Math.PI * 2;
          const clusterRadius = 16;
          const centerX = Math.cos(clusterAngle) * clusterRadius;
          const centerZ = Math.sin(clusterAngle) * clusterRadius;
          const centerY = ((validIdx % 3) - 1) * 6;
          const localX = (data.x % 4) * 0.8;
          const localY = (data.y % 4) * 0.8;
          const localZ = (data.z % 4) * 0.8;
          mesh.position.lerp(new THREE.Vector3(centerX + localX, centerY + localY, centerZ + localZ), 0.06);
          ring.position.copy(mesh.position);
        } else if (!isClusterByDnaActiveRef.current && !orbitRef.current.isDraggingNode && !pinnedNodesRef.current.has(id)) {
          mesh.position.lerp(new THREE.Vector3(data.x, data.y, data.z), 0.08);
          ring.position.copy(mesh.position);
        }

        // 4. Focus Mode: Dim nodes not connected to current conversation tab or active message cluster
        if (isFocusModeActiveRef.current && !q) {
          const isConnectedToTab = data.tabId === activeTabIdRef.current ||
                                   (data.messageId && activeMessageIdsRef.current.has(data.messageId)) ||
                                   data.role === "seed" || data.pinned;
          if (isConnectedToTab) {
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.emissiveIntensity = Math.max(mat.emissiveIntensity, 2.0 + Math.sin(elapsed * 6 + mesh.position.x) * 0.8);
            const pulse = (1.2 + Math.sin(elapsed * 4) * 0.1) * customScale;
            mesh.scale.set(pulse, pulse, pulse);
            ring.visible = true;
          } else {
            mat.transparent = true;
            mat.opacity = 0.08;
            ring.visible = false;
          }
        }
      });

      // Synaptic Glow Pulse on LLM Message Streaming & Dynamic Vertex Updating
      const isStreamingActive = isStreamingRef.current || consciousnessRef.current === "speaking" || consciousnessRef.current === "agent-processing" || neuralBurstRef.current?.active;
      const compTokens = completionTokensRef.current || 150;
      const glowFactor = Math.min(1.0, Math.max(0.2, compTokens / 400));

      linkLinesRef.current.forEach((lines) => {
        const mat = lines.material as THREE.LineBasicMaterial;
        if (isFocusModeActiveRef.current) {
          mat.opacity = 0.08;
        } else if (isStreamingActive) {
          const pulse = Math.sin(elapsed * (8 + glowFactor * 10)) * 0.28;
          mat.opacity = Math.min(1.0, Math.max(0.45, 0.5 + glowFactor * 0.45 + pulse));
        } else {
          mat.opacity += (0.35 - mat.opacity) * 0.1;
        }

        // Dynamically update line segment vertices if a node is being dragged or repositioned!
        if (orbitRef.current.isDraggingNode && orbitRef.current.draggedNode) {
          const posAttr = lines.geometry.getAttribute("position") as THREE.BufferAttribute;
          if (posAttr) {
            const currentMap = nodeMeshesRef.current;
            let idx = 0;
            links.forEach((link) => {
              const src = currentMap.get(link.sourceId);
              const tgt = currentMap.get(link.targetId);
              if (src && tgt && idx + 5 < posAttr.count * 3) {
                posAttr.setXYZ(idx / 3, src.mesh.position.x, src.mesh.position.y, src.mesh.position.z);
                posAttr.setXYZ((idx / 3) + 1, tgt.mesh.position.x, tgt.mesh.position.y, tgt.mesh.position.z);
              }
              idx += 6;
            });
            posAttr.needsUpdate = true;
          }
        }
      });

      // Animate Synaptic Pathfinding glowing curve & traveling beads
      if (pathfindingGroupRef.current && pathfindingCurveRef.current && synapticPathfindingRef.current?.active) {
        const curve = pathfindingCurveRef.current;
        const time = performance.now() / 1000;
        pathfindingBeadsRef.current.forEach((bead) => {
          const t = (time * bead.userData.speed + bead.userData.offset) % 1.0;
          const pos = curve.getPointAt(t);
          bead.position.copy(pos);
          const scale = 1.0 + Math.sin(t * Math.PI) * 1.5;
          bead.scale.set(scale, scale, scale);
        });
        pathfindingGroupRef.current.children.forEach((child: any) => {
          if (child.userData?.isTargetRing) {
            child.lookAt(camera.position);
            const s = 1.0 + Math.sin(time * 8) * 0.35;
            child.scale.set(s, s, s);
            child.rotateZ(0.04);
          }
        });
      }

      // Check 30-second idle timer for Zen-Orbit Mode
      const now = performance.now();
      if (!zenOrbitRef.current && (now - lastInteractionRef.current >= 30000) && !orbitRef.current.isDragging && !orbitRef.current.isDraggingNode && !orbitRef.current.cinematicActive) {
        setZenOrbitState(true);
      }

      // Update Orbit / Camera Rig
      if ((orbitRef.current.autoRotate || zenOrbitRef.current) && !orbitRef.current.isDragging && !orbitRef.current.cinematicActive) {
        const speed = zenOrbitRef.current ? 0.0025 : 0.004;
        orbitRef.current.theta += speed;
        if (zenOrbitRef.current) {
          // Zen-Orbit: gentle vertical undulation and smooth breathing orbit
          orbitRef.current.phi = (Math.PI / 2) + Math.sin(elapsed * 0.35) * 0.22;
        }
      }

      // Animate Neural Burst Swarm & Shockwave
      if (burstParticlesRef.current && burstPulseRef.current && swarmMat && shockMat && shockMesh) {
        const isBurst = neuralBurstRef.current?.active || consciousnessRef.current === "speaking" || consciousnessRef.current === "agent-processing";
        const targetOpacity = isBurst ? 0.95 : 0.0;
        swarmMat.opacity += (targetOpacity - swarmMat.opacity) * 0.1;
        
        if (swarmMat.opacity > 0.05) {
          const posAttr = swarmGeo.getAttribute("position") as THREE.BufferAttribute;
          const colAttr = swarmGeo.getAttribute("color") as THREE.BufferAttribute;
          const meshes = Array.from(nodeMeshesRef.current.values());
          
          if (meshes.length > 1 && posAttr && colAttr) {
            for (let i = 0; i < swarmCount; i++) {
              const srcIdx = i % meshes.length;
              const tgtIdx = (i * 7 + 3) % meshes.length;
              const srcPos = meshes[srcIdx].mesh.position;
              const tgtPos = meshes[tgtIdx].mesh.position;
              
              const speed = 0.8 + (i % 5) * 0.4;
              const t = ((elapsed * speed + (i / swarmCount)) % 1);
              
              posAttr.setXYZ(
                i,
                srcPos.x + (tgtPos.x - srcPos.x) * t + (Math.sin(elapsed * 6 + i) * 0.15),
                srcPos.y + (tgtPos.y - srcPos.y) * t + (Math.cos(elapsed * 6 + i) * 0.15),
                srcPos.z + (tgtPos.z - srcPos.z) * t
              );

              // Color shift cyan <-> magenta <-> gold during burst
              const c = new THREE.Color(0x00ffff).lerp(new THREE.Color(0xff007f), Math.sin(t * Math.PI));
              colAttr.setXYZ(i, c.r, c.g, c.b);
            }
            posAttr.needsUpdate = true;
            colAttr.needsUpdate = true;
          }

          const shockScale = 1.0 + ((elapsed * 2) % 3) * 3.0;
          shockMesh.scale.set(shockScale, shockScale, shockScale);
          shockMat.opacity = Math.max(0, 0.7 - ((elapsed * 2) % 3) * 0.23);
          shockMesh.rotation.y += 0.05;
        } else {
          shockMat.opacity = 0;
        }
      }

      // Animate Cortex City Buildings & NPCs
      if (cortexCityGroupRef.current && npcGroupRef.current) {
        cortexCityGroupRef.current.visible = isCortexCityActiveRef.current;
        npcGroupRef.current.visible = isCortexCityActiveRef.current;
        cortexCityGroupRef.current.rotation.y += 0.001;

        if (isCortexCityActiveRef.current) {
          const tok = totalTokensRef.current || 1000;
          // Every 80 tokens unlocks a new building
          const unlockedCount = Math.min(cityBuildingsRef.current.length, Math.max(8, Math.floor(tok / 80)));
          cityBuildingsRef.current.forEach((b, idx) => {
            if (idx < unlockedCount) {
              b.mesh.visible = true;
              b.height += (b.targetHeight - b.height) * 0.05;
              b.mesh.scale.set(1, b.height, 1);
              b.mesh.position.y = (b.height / 2) - 4;
            } else {
              b.mesh.visible = false;
            }
          });

          // Animate NPC Drones & Synthesizing Lasers
          const meshes = Array.from(nodeMeshesRef.current.values());
          npcDronesRef.current.forEach((drone, idx) => {
            drone.angle += drone.speed;
            const dx = Math.cos(drone.angle) * drone.radius;
            const dz = Math.sin(drone.angle) * drone.radius;
            const dy = Math.sin(elapsed * 2 + drone.yOffset) * 3.5;
            drone.mesh.position.set(dx, dy, dz);
            drone.mesh.rotation.y += 0.03;
            drone.mesh.rotation.z += 0.02;

            // Pick a target node or building to synthesize
            if (!drone.targetNode && meshes.length > 0 && Math.random() < 0.02) {
              drone.targetNode = meshes[Math.floor(Math.random() * meshes.length)].mesh;
            } else if (Math.random() < 0.005) {
              drone.targetNode = null;
            }

            if (drone.targetNode && drone.laser) {
              drone.laser.visible = true;
              const posAttr = drone.laser.geometry.getAttribute("position") as THREE.BufferAttribute;
              if (posAttr) {
                posAttr.setXYZ(0, drone.mesh.position.x, drone.mesh.position.y, drone.mesh.position.z);
                posAttr.setXYZ(1, drone.targetNode.position.x, drone.targetNode.position.y, drone.targetNode.position.z);
                posAttr.needsUpdate = true;
              }
              const mat = drone.laser.material as THREE.LineBasicMaterial;
              mat.opacity = 0.4 + Math.sin(elapsed * 12 + idx) * 0.35;
            } else if (drone.laser) {
              drone.laser.visible = false;
            }
          });
        } else {
          npcDronesRef.current.forEach((drone) => { if (drone.laser) drone.laser.visible = false; });
        }
      }

      if (isGameModeActiveRef.current) {
        // Ghost POV Game Mode: Free camera movement in 3D world!
        const keys = gameKeysRef.current;
        const speedBoost = keys["shift"] || keys["shiftleft"] || keys["shiftright"] || keys["space"] || keys["boost"];
        const baseSpeed = speedBoost ? 0.38 : 0.14;

        // Yaw and Pitch rotation with Q / R (or E) and arrow keys
        if (keys["q"] || keys["arrowleft"] || keys["turnleft"]) gameRotationRef.current.yaw += 0.04;
        if (keys["r"] || keys["e"] || keys["arrowright"] || keys["turnright"]) gameRotationRef.current.yaw -= 0.04;
        if (keys["pageup"] || keys["looktop"]) gameRotationRef.current.pitch = Math.min(Math.PI / 2 - 0.1, gameRotationRef.current.pitch + 0.03);
        if (keys["pagedown"] || keys["lookdown"]) gameRotationRef.current.pitch = Math.max(-Math.PI / 2 + 0.1, gameRotationRef.current.pitch - 0.03);

        const yaw = gameRotationRef.current.yaw;
        const pitch = gameRotationRef.current.pitch;

        // Calculate forward and right directional vectors
        const forward = new THREE.Vector3(
          Math.sin(yaw) * Math.cos(pitch),
          Math.sin(pitch),
          Math.cos(yaw) * Math.cos(pitch)
        ).normalize();
        const right = new THREE.Vector3(Math.sin(yaw - Math.PI / 2), 0, Math.cos(yaw - Math.PI / 2)).normalize();

        if (keys["w"] || keys["arrowup"] || keys["forward"]) gamePositionRef.current.addScaledVector(forward, -baseSpeed);
        if (keys["s"] || keys["arrowdown"] || keys["back"]) gamePositionRef.current.addScaledVector(forward, baseSpeed);
        if (keys["a"] || keys["left"]) gamePositionRef.current.addScaledVector(right, -baseSpeed);
        if (keys["d"] || keys["right"]) gamePositionRef.current.addScaledVector(right, baseSpeed);

        camera.position.copy(gamePositionRef.current);
        const lookTarget = new THREE.Vector3().copy(gamePositionRef.current).addScaledVector(forward, -10);
        camera.lookAt(lookTarget);
      } else {
        const sp = Math.sin(orbitRef.current.phi);
        const cp = Math.cos(orbitRef.current.phi);
        const st = Math.sin(orbitRef.current.theta);
        const ct = Math.cos(orbitRef.current.theta);
        const r = orbitRef.current.radius;
        camera.position.set(r * sp * ct, r * cp, r * sp * st);
        camera.lookAt(0, 0, 0);

        // Keep gamePosition and yaw in sync while in Orbit mode
        gamePositionRef.current.copy(camera.position);
        gameRotationRef.current.yaw = orbitRef.current.theta;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileOrTablet ? 1.25 : 2));
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Interaction handlers (mouse drag / zoom / hover / click)
    const handleMouseDown = (e: MouseEvent) => {
      if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.button === 2 || e.button === 1 || clusterRotateModeRef.current) {
        orbitRef.current.isRotatingCluster = true;
        isRotatingClusterRef.current = true;
        setIsRotatingCluster(true);
        orbitRef.current.autoRotate = false;
        orbitRef.current.prevMouse = { x: e.clientX, y: e.clientY };
        if (renderer.domElement) renderer.domElement.style.cursor = "move";
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const meshes = Array.from(nodeMeshesRef.current.values()).map((v: any) => v.mesh);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const found = Array.from(nodeMeshesRef.current.values()).find((v: any) => v.mesh === hitMesh) as any;
        if (found) {
          orbitRef.current.isDraggingNode = true;
          orbitRef.current.draggedNode = found.data;
          orbitRef.current.dragPlane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()).negate(), hitMesh.position);
          container.style.cursor = "grabbing";
          return;
        }
      }
      orbitRef.current.isDragging = true;
      orbitRef.current.autoRotate = false;
      orbitRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (orbitRef.current.isRotatingCluster && cosmicGroupRef.current) {
        const dx = e.clientX - orbitRef.current.prevMouse.x;
        const dy = e.clientY - orbitRef.current.prevMouse.y;
        cosmicGroupRef.current.rotation.y += dx * 0.007;
        cosmicGroupRef.current.rotation.x += dy * 0.007;
        orbitRef.current.prevMouse = { x: e.clientX, y: e.clientY };
        setHasRotatedAxis(true);
        return;
      }
      if (orbitRef.current.isDraggingNode && orbitRef.current.draggedNode) {
        const rect = renderer.domElement.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        const intersectPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(orbitRef.current.dragPlane, intersectPoint)) {
          const node = orbitRef.current.draggedNode;
          node.x = intersectPoint.x;
          node.y = intersectPoint.y;
          node.z = intersectPoint.z;
          const item = nodeMeshesRef.current.get(node.id);
          if (item) {
            item.mesh.position.set(node.x, node.y, node.z);
            item.ring.position.set(node.x, node.y, node.z);
          }
        }
        return;
      }
      if (orbitRef.current.isDragging) {
        const dx = e.clientX - orbitRef.current.prevMouse.x;
        const dy = e.clientY - orbitRef.current.prevMouse.y;
        orbitRef.current.theta -= dx * 0.005;
        orbitRef.current.phi = Math.max(0.15, Math.min(Math.PI - 0.15, orbitRef.current.phi - dy * 0.005));
        orbitRef.current.prevMouse = { x: e.clientX, y: e.clientY };
        return;
      }

      // Raycast hover check
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const meshes = Array.from(nodeMeshesRef.current.values()).map((v: any) => v.mesh);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const found = Array.from(nodeMeshesRef.current.values()).find((v: any) => v.mesh === hitMesh) as any;
        if (found) {
          setHoveredNode(found.data);
          setTooltipPos({ x: e.clientX, y: e.clientY });
          onNodeHover?.(found.data);
          container.style.cursor = "pointer";
          return;
        }
      }
      if (hoveredNode) {
        setHoveredNode(null);
        onNodeHover?.(null);
        container.style.cursor = "grab";
      }
    };
    const handleMouseUp = () => {
      if (orbitRef.current.isRotatingCluster) {
        orbitRef.current.isRotatingCluster = false;
        isRotatingClusterRef.current = false;
        setIsRotatingCluster(false);
        if (renderer.domElement) renderer.domElement.style.cursor = "grab";
        setTimeout(() => {
          if (!orbitRef.current.isDragging && !orbitRef.current.isRotatingCluster && (zenOrbitRef.current || cameraShot === "autoPilot")) {
            orbitRef.current.autoRotate = true;
          }
        }, 2000);
        return;
      }
      if (orbitRef.current.isDraggingNode && orbitRef.current.draggedNode) {
        const node = orbitRef.current.draggedNode;
        const dist = Math.hypot(node.x, node.z);
        const isOuter = dist > 6.0;
        const ringName = isOuter ? "Outer Orbital Zone" : "Core Orbital Zone";
        const priority = isOuter ? "Normal Priority (Archive / Low Frequency)" : "High Priority (Real-Time Synapse / Core)";
        try {
          const savedPosRaw = localStorage.getItem("senpai_custom_node_pos_v1");
          const savedPos = savedPosRaw ? JSON.parse(savedPosRaw) : {};
          savedPos[node.id] = { x: node.x, y: node.y, z: node.z };
          localStorage.setItem("senpai_custom_node_pos_v1", JSON.stringify(savedPos));
        } catch (_) {}
        onNodePositionChange?.(node.id, node.x, node.y, node.z);
        onOrbitalReconfigure?.(node, ringName, priority);
        playPulseSound(soundFxEnabled);
        orbitRef.current.isDraggingNode = false;
        orbitRef.current.draggedNode = null;
        container.style.cursor = "grab";
        return;
      }
      if (orbitRef.current.isDragging) {
        const wasDragging = orbitRef.current.isDragging;
        orbitRef.current.isDragging = false;
        setTimeout(() => {
          if (!orbitRef.current.isDragging && (zenOrbitRef.current || cameraShot === "autoPilot")) {
            orbitRef.current.autoRotate = true;
          }
        }, 2000);
      }
    };
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitRef.current.radius = Math.max(5, Math.min(35, orbitRef.current.radius + e.deltaY * 0.015));
    };
    const handleClick = (e: MouseEvent) => {
      if (orbitRef.current.isDragging || orbitRef.current.isRotatingCluster) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const meshes = Array.from(nodeMeshesRef.current.values()).map((v: any) => v.mesh);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const found = Array.from(nodeMeshesRef.current.values()).find((v: any) => v.mesh === hitMesh) as any;
        if (found && onNodeClick) {
          playPulseSound(soundFxEnabled);
          onNodeClick(found.data);
        }
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      if (orbitRef.current.isDragging || orbitRef.current.isRotatingCluster) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const meshes = Array.from(nodeMeshesRef.current.values()).map((v: any) => v.mesh);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const found = Array.from(nodeMeshesRef.current.values()).find((v: any) => v.mesh === hitMesh) as any;
        if (found) {
          togglePinNode(found.data.id, e as any);
        }
      }
    };

    const handleUserInteraction = () => {
      const nowTime = performance.now();
      if (nowTime < zenOrbitGraceRef.current) return;
      lastInteractionRef.current = nowTime;
      if (zenOrbitRef.current) {
        setZenOrbitState(false);
      }
    };

    const handleContextMenu = (e: Event) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      gameKeysRef.current[k] = true;
      if (isGameModeActiveRef.current) {
        if (["w", "a", "s", "d", "q", "r", "e", "arrowup", "arrowdown", "arrowleft", "arrowright", " ", "shift"].includes(k)) {
          e.preventDefault();
        }
        if (k === "z") {
          onToggleGameModeRef.current?.();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      gameKeysRef.current[k] = false;
    };

    const dom = renderer.domElement;
    dom.style.cursor = "grab";
    dom.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    dom.addEventListener("wheel", handleWheel, { passive: false });
    dom.addEventListener("click", handleClick);
    dom.addEventListener("dblclick", handleDoubleClick);
    dom.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleUserInteraction);
    window.addEventListener("mousedown", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);
    window.addEventListener("touchstart", handleUserInteraction);
    window.addEventListener("wheel", handleUserInteraction);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      dom.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      dom.removeEventListener("wheel", handleWheel);
      dom.removeEventListener("click", handleClick);
      dom.removeEventListener("dblclick", handleDoubleClick);
      dom.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleUserInteraction);
      window.removeEventListener("mousedown", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("wheel", handleUserInteraction);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, []);

  // Sync Nodes with 3D Scene
  useEffect(() => {
    if (!cosmicGroupRef.current) return;
    const cosmic = cosmicGroupRef.current;
    const currentMap = nodeMeshesRef.current;
    const newIds = new Set(nodes.map(n => n.id));

    // Remove deleted nodes
    currentMap.forEach((val, id) => {
      if (!newIds.has(id)) {
        cosmic.remove(val.mesh);
        cosmic.remove(val.ring);
        val.mesh.geometry.dispose();
        (val.mesh.material as THREE.Material).dispose();
        val.ring.geometry.dispose();
        (val.ring.material as THREE.Material).dispose();
        currentMap.delete(id);
      }
    });

    // Add new nodes
    let savedPos: Record<string, { x: number; y: number; z: number }> = {};
    try {
      const savedPosRaw = localStorage.getItem("senpai_custom_node_pos_v1");
      if (savedPosRaw) savedPos = JSON.parse(savedPosRaw);
    } catch (_) {}

    nodes.forEach((node, idx) => {
      if (savedPos[node.id]) {
        node.x = savedPos[node.id].x;
        node.y = savedPos[node.id].y;
        node.z = savedPos[node.id].z;
      }
      const dna = getDnaForIndex(idx);
      const baseShape = neuronCustomization?.geometryShape && neuronCustomization.geometryShape !== "adaptive"
        ? neuronCustomization.geometryShape
        : dna.shape;
      const shapeToUse = isAdaptiveActive
        ? getAdaptiveShapeForNode(activeTokens, idx, node.role, baseShape)
        : baseShape;
      const sizeScale = neuronCustomization?.sizeScale || 1.0;
      const baseCol = neuronCustomization?.baseColor ? new THREE.Color(neuronCustomization.baseColor) : (node.colorNum || dna.colorNum);
      const glowInt = neuronCustomization?.glowIntensity || 1.0;

      if (!currentMap.has(node.id)) {
        const size = (0.15 + Math.random() * 0.08) * sizeScale;
        const geo = createGeometryForShape(shapeToUse, size);
        const mat = new THREE.MeshStandardMaterial({
          color: baseCol,
          emissive: baseCol,
          emissiveIntensity: 1.0 * glowInt,
          roughness: 0.2,
          metalness: 0.5,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(node.x, node.y, node.z);
        cosmic.add(mesh);

        // Data Ring (Supporter Gold Aura support)
        const isGold = isSupporter && (node.role === "ai" || node.strength > 75);
        const ringGeo = new THREE.TorusGeometry(isGold ? 0.32 : 0.26, isGold ? 0.028 : 0.02, 12, 24);
        const ringMat = new THREE.MeshStandardMaterial({
          color: isGold ? 0xfacc15 : (node.role === "ai" ? 0xffd700 : 0x00d4ff),
          emissive: isGold ? 0xfacc15 : (node.role === "ai" ? 0xffd700 : 0x00d4ff),
          emissiveIntensity: isGold ? 1.0 : 0.6,
          transparent: true,
          opacity: isGold ? 0.95 : 0.7,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(node.x, node.y, node.z);
        cosmic.add(ring);

        currentMap.set(node.id, { mesh, ring, data: node, shape: shapeToUse.toLowerCase(), baseSize: size });
        playSpawnSound(soundFxEnabled);
      } else {
        // update existing position or data
        const item = currentMap.get(node.id)!;
        item.data = node;
        item.mesh.position.set(node.x, node.y, node.z);
        item.ring.position.set(node.x, node.y, node.z);

        // Apply custom colors and emissive intensity to existing nodes
        if (neuronCustomization?.baseColor) {
          (item.mesh.material as THREE.MeshStandardMaterial).color = baseCol as THREE.Color;
          (item.mesh.material as THREE.MeshStandardMaterial).emissive = baseCol as THREE.Color;
        }
        (item.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.0 * glowInt;
        item.mesh.scale.set(sizeScale, sizeScale, sizeScale);

        const targetShape = shapeToUse.toLowerCase();
        if (item.shape !== targetShape || !item.baseSize) {
          const baseSize = item.baseSize || ((0.15 + Math.random() * 0.08) * sizeScale);
          item.baseSize = baseSize;
          item.mesh.geometry.dispose();
          item.mesh.geometry = createGeometryForShape(targetShape, baseSize);
          item.shape = targetShape;
        }
      }
    });
  }, [nodes, soundFxEnabled, neuronCustomization, isAdaptiveActive, activeTokens]);

  // Sync Synaptic Links
  useEffect(() => {
    if (!cosmicGroupRef.current) return;
    const cosmic = cosmicGroupRef.current;

    // Remove old lines
    linkLinesRef.current.forEach(line => {
      cosmic.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    });
    linkLinesRef.current = [];

    const currentMap = nodeMeshesRef.current;
    const positions: number[] = [];
    const colors: number[] = [];

    links.forEach(link => {
      const src = currentMap.get(link.sourceId);
      const tgt = currentMap.get(link.targetId);
      if (src && tgt) {
        positions.push(
          src.mesh.position.x, src.mesh.position.y, src.mesh.position.z,
          tgt.mesh.position.x, tgt.mesh.position.y, tgt.mesh.position.z
        );
        const col = new THREE.Color(link.active ? 0x00ffff : 0x3b82f6);
        colors.push(col.r, col.g, col.b, col.r, col.g, col.b);
      }
    });

    if (positions.length > 0) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      const lines = new THREE.LineSegments(geo, mat);
      cosmic.add(lines);
      linkLinesRef.current.push(lines);
    }
  }, [links, nodes]);

  // Sync Synaptic Pathfinding 3D Visualization
  useEffect(() => {
    if (!cosmicGroupRef.current) return;
    const cosmic = cosmicGroupRef.current;

    if (pathfindingGroupRef.current) {
      cosmic.remove(pathfindingGroupRef.current);
      pathfindingGroupRef.current.traverse((child: any) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose());
          else child.material.dispose();
        }
      });
      pathfindingGroupRef.current = null;
      pathfindingBeadsRef.current = [];
      pathfindingCurveRef.current = null;
    }

    if (!synapticPathfinding?.active) return;

    const currentMap = nodeMeshesRef.current;
    const src = currentMap.get(synapticPathfinding.sourceId);
    const tgt = currentMap.get(synapticPathfinding.targetId);

    if (src && tgt) {
      const group = new THREE.Group();
      const srcPos = src.mesh.position.clone();
      const tgtPos = tgt.mesh.position.clone();
      const dist = srcPos.distanceTo(tgtPos);

      // Create an arcing bezier curve in 3D
      const midPos = srcPos.clone().add(tgtPos).multiplyScalar(0.5);
      midPos.y += Math.max(3.0, dist * 0.45);
      midPos.z += (Math.random() - 0.5) * 3;
      const curve = new THREE.QuadraticBezierCurve3(srcPos, midPos, tgtPos);
      pathfindingCurveRef.current = curve;

      // Inner glowing core line
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.08, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      });
      group.add(new THREE.Mesh(tubeGeo, tubeMat));

      // Outer soft aura tube
      const auraGeo = new THREE.TubeGeometry(curve, 64, 0.25, 8, false);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
      });
      group.add(new THREE.Mesh(auraGeo, auraMat));

      // Traveling glowing energy beads
      const beads: THREE.Mesh[] = [];
      const beadGeo = new THREE.SphereGeometry(0.28, 16, 16);
      for (let i = 0; i < 7; i++) {
        const beadMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xffffff : (i % 3 === 0 ? 0xf43f5e : 0x00ffff),
          transparent: true,
          opacity: 1.0,
          blending: THREE.AdditiveBlending,
        });
        const beadMesh = new THREE.Mesh(beadGeo, beadMat);
        beadMesh.userData = { offset: i / 7, speed: 0.4 + (i % 3) * 0.15 };
        group.add(beadMesh);
        beads.push(beadMesh);
      }
      pathfindingBeadsRef.current = beads;

      // Target cluster highlighting halo ring
      const ringGeo = new THREE.RingGeometry(0.9, 1.45, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(tgtPos);
      ringMesh.userData = { isTargetRing: true };
      group.add(ringMesh);

      cosmic.add(group);
      pathfindingGroupRef.current = group;
      playPulseSound(soundFxEnabled);
    }
  }, [synapticPathfinding, nodes, soundFxEnabled]);

  // Handle Cinematic Camera Transitions
  useEffect(() => {
    if (!cameraShot || !cameraRef.current) return;
    const orbit = orbitRef.current;
    if (zenOrbitRef.current && cameraShot !== "zenOrbit") {
      setZenOrbitState(false);
    }
    orbit.autoRotate = false;
    orbit.cinematicActive = true;

    const startRadius = orbit.radius;
    const startPhi = orbit.phi;
    const startTheta = orbit.theta;

    let targetRadius = startRadius;
    let targetPhi = startPhi;
    let targetTheta = startTheta;

    switch (cameraShot) {
      case "pushIn":
        targetRadius = Math.max(8, startRadius * 0.72);
        targetPhi = startPhi - 0.15;
        targetTheta = startTheta + 0.35;
        break;
      case "orbitSweep":
        targetRadius = startRadius * 1.05;
        targetPhi = Math.PI / 2 + 0.1;
        targetTheta = startTheta + 1.2;
        break;
      case "tiltHero":
        targetRadius = Math.max(10, startRadius * 0.88);
        targetPhi = Math.max(0.3, startPhi - 0.35);
        targetTheta = startTheta - 0.25;
        break;
      case "pullReveal":
        targetRadius = Math.min(28, startRadius * 1.35);
        targetPhi = Math.PI / 2 - 0.1;
        targetTheta = startTheta - 0.5;
        break;
      case "driftWide":
        targetRadius = 22;
        targetPhi = Math.PI / 2.2;
        targetTheta = startTheta + 0.6;
        break;
      case "quickPunch":
        targetRadius = startRadius * 0.9;
        break;
      case "neuralBurstPOV":
        targetRadius = Math.max(6, startRadius * 0.55);
        targetPhi = Math.PI / 2 + 0.15;
        targetTheta = startTheta + 0.8;
        break;
      case "synapseGlide":
        targetRadius = 9;
        targetPhi = Math.PI / 2 - 0.2;
        targetTheta = startTheta - 0.9;
        break;
      case "coreDive":
        targetRadius = 5;
        targetPhi = Math.PI / 2;
        targetTheta = startTheta + 1.5;
        break;
      case "orbitShift":
        targetRadius = Math.min(22, startRadius * 1.15);
        targetPhi = Math.PI / 2 - 0.1;
        targetTheta = startTheta + 0.5;
        break;
      case "autoPilot":
        orbit.autoRotate = true;
        targetRadius = 14;
        targetPhi = Math.PI / 2 + 0.2;
        targetTheta = startTheta + 3.14;
        break;
      case "zenOrbit":
        setZenOrbitState(true);
        targetRadius = 16;
        targetPhi = Math.PI / 2 + 0.15;
        targetTheta = startTheta + 3.14;
        break;
    }

    const startTime = performance.now();
    const duration = 1200;
    let frameId: number;

    const tween = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      orbit.radius = startRadius + (targetRadius - startRadius) * ease;
      orbit.phi = Math.max(0.15, Math.min(Math.PI - 0.15, startPhi + (targetPhi - startPhi) * ease));
      orbit.theta = startTheta + (targetTheta - startTheta) * ease;

      if (p < 1) {
        frameId = requestAnimationFrame(tween);
      } else {
        orbit.cinematicActive = false;
        setTimeout(() => {
          if (!orbit.isDragging && (cameraShot === "autoPilot" || cameraShot === "zenOrbit" || orbit.autoRotate)) {
            orbit.autoRotate = true;
          }
        }, 1000);
      }
    };
    frameId = requestAnimationFrame(tween);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [cameraShot]);

  const toggleClusterRotateMode = () => {
    const next = !clusterRotateMode;
    setClusterRotateMode(next);
    onClusterRotateModeChange?.(next);
  };

  const handleResetClusterAxis = () => {
    if (cosmicGroupRef.current) {
      cosmicGroupRef.current.rotation.set(0, 0, 0);
      setHasRotatedAxis(false);
      playPulseSound(soundFxEnabled);
    }
  };

  return (
    <div className={`relative w-full h-full bg-transparent overflow-hidden select-none transition-shadow duration-500 ${isSupporter ? "shadow-[inset_0_0_40px_rgba(234,179,8,0.2)] border-b sm:border-r border-yellow-500/30" : ""}`}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      
      {/* Supporter Gold Aura Indicator & Orbital Drag Guide & Adaptive Geometry Status */}
      <div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5 pointer-events-none font-mono">
        {isSupporter && (
          <div className="flex items-center gap-2 bg-yellow-950/80 border border-yellow-500/60 text-yellow-300 px-3 py-1 rounded-full text-[10px] font-bold shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-pulse backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />
            <span>SUPPORTER GOLD AURA ACTIVE</span>
          </div>
        )}
        {isAdaptiveActive && (
          <div className="flex items-center gap-2 bg-purple-950/80 border border-purple-500/60 text-purple-300 px-3 py-1 rounded-full text-[10px] font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
            <span>ADAPTIVE GEOMETRY — INTENSITY: {activeTokens} TOK ({Math.round(tokenIntensity * 100)}%)</span>
          </div>
        )}
        {isNeuralDecayActive && (
          <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-500/60 text-amber-300 px-3 py-1 rounded-full text-[10px] font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <span>NEURAL DECAY ACTIVE — SHORT-TERM MEMORY FOCUS</span>
          </div>
        )}
        {isRotatingCluster && (
          <div className="flex items-center gap-2 bg-indigo-950/90 border-2 border-indigo-400 text-indigo-200 px-3 py-1 rounded-full text-[10px] font-bold shadow-[0_0_20px_rgba(99,102,241,0.8)] animate-pulse backdrop-blur-md">
            <Orbit className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>CLUSTER AXIS ROTATION ACTIVE — TILTING 3D NEURAL CORE ON ITS AXIS</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-cyan-500/30 text-cyan-400 px-2.5 py-0.5 rounded-full text-[9px] backdrop-blur-md opacity-80">
          <span>⚡ Hold SHIFT + Drag (or Right-Click) to rotate cluster axis · Drag nodes to re-organize · Dbl-click to Pin/Unpin</span>
        </div>
      </div>

      {/* Synaptic Pathfinding Floating Banner */}
      {synapticPathfinding?.active && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-purple-950/90 border-2 border-purple-500/80 text-purple-200 px-4 py-2 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.7)] animate-bounce backdrop-blur-xl pointer-events-none">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />
          <div className="flex flex-col font-mono text-center">
            <span className="text-[10px] text-cyan-400 font-black tracking-[0.2em] uppercase">SYNAPTIC PATHFINDING ACTIVE</span>
            <span className="text-xs sm:text-sm font-bold text-white">
              Referencing Distant Cluster: <span className="text-purple-300 underline decoration-cyan-400">[{synapticPathfinding.keyword || "PAST MEMORY CLUSTER"}]</span>
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping ml-1" />
        </div>
      )}

      {/* Node Tooltip on Hover */}
      {hoveredNode && (
        <div 
          className="absolute z-30 pointer-events-none bg-slate-950/95 border border-cyan-500/50 text-slate-200 px-4 py-3 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.4)] backdrop-blur-2xl transform -translate-x-1/2 -translate-y-full transition-all duration-150 text-xs font-mono w-72 max-w-[90vw]"
          style={{ top: Math.max(80, tooltipPos.y - 20), left: Math.min(Math.max(tooltipPos.x, 150), window.innerWidth - 150) }}
        >
          <div className="flex items-center gap-2 border-b border-white/10 pb-1.5 mb-1.5 font-mono">
            <span className="w-2.5 h-2.5 rounded-full inline-block shadow-[0_0_8px_currentColor]" style={{ backgroundColor: hoveredNode.colorNum ? `#${hoveredNode.colorNum.toString(16).padStart(6, '0')}` : "#22d3ee" }} />
            <span className="font-bold text-cyan-400 uppercase tracking-wider text-sm truncate">{hoveredNode.keyword || "NEURON"}</span>
            {hoveredNode.pinned || pinnedNodes.has(hoveredNode.id) ? (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/50 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider ml-1 shrink-0 flex items-center gap-1">
                ★ PINNED
              </span>
            ) : null}
            <span className="ml-auto text-[9px] text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0">{hoveredNode.role}</span>
          </div>
          <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">DNA Archetype:</span>
              <span className="text-indigo-400 font-bold tracking-wide">{hoveredNode.dnaType || "Cognitive"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Genesis Timestamp:</span>
              <span className="text-amber-300 font-semibold text-[10px]">{hoveredNode.birthTime ? new Date(hoveredNode.birthTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " (" + new Date(hoveredNode.birthTime).toLocaleDateString() + ")" : "Genesis Epoch"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Synaptic Strength:</span>
              <span className="text-emerald-400 font-bold">{hoveredNode.strength.toFixed(1)}%</span>
            </div>
            <div className="text-[9px] text-slate-500 pt-1.5 border-t border-white/5 uppercase tracking-widest text-center">Dbl-click to Pin/Unpin · Single-click to focus POV</div>
          </div>
        </div>
      )}

      {/* Interactive Camera Rig & POV Action Controls (Unified 3-Pod Floating Cockpit with Generous Whitespace) */}
      <div className="absolute bottom-3 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-30 flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-4 font-mono text-xs max-w-[98%] sm:max-w-[92%] xl:max-w-none pointer-events-none">
        {/* Pod 1: POV & Camera Control Rig (Glassmorphic Group) */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 bg-slate-950/80 border border-cyan-500/30 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.15)] backdrop-blur-xl pointer-events-auto overflow-x-auto no-scrollbar max-w-full">
          <div className="flex items-center gap-1 px-2 text-[10px] text-cyan-400 font-bold uppercase tracking-widest border-r border-white/10 shrink-0">
            <Camera className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden md:inline">POV Rig</span>
          </div>

          <button
            onClick={() => onTriggerCameraShot?.("pushIn")}
            className="px-2 py-1 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded-xl transition-all flex items-center gap-1 border border-transparent hover:border-cyan-500/40 shrink-0 text-[10px]"
            title="Push In POV"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Push In</span>
          </button>

          <button
            onClick={() => onTriggerCameraShot?.("orbitSweep")}
            className="px-2 py-1 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded-xl transition-all flex items-center gap-1 border border-transparent hover:border-cyan-500/40 shrink-0 text-[10px]"
            title="Orbit Sweep POV"
          >
            <Orbit className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Orbit</span>
          </button>

          <button
            onClick={() => onTriggerCameraShot?.("tiltHero")}
            className="px-2 py-1 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded-xl transition-all flex items-center gap-1 border border-transparent hover:border-cyan-500/40 shrink-0 text-[10px]"
            title="Hero Low Angle POV"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Hero Tilt</span>
          </button>

          <button
            onClick={() => onTriggerCameraShot?.("neuralBurstPOV")}
            className="px-2 py-1 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 rounded-xl transition-all flex items-center gap-1 border border-transparent hover:border-rose-500/40 shrink-0 text-[10px]"
            title="Swoop into Neural Transmission"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden lg:inline">Burst POV</span>
          </button>

          {/* HIGHLIGHTED PRIMARY BUTTON: Auto-Pilot */}
          <button
            onClick={() => onTriggerCameraShot?.("autoPilot")}
            className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-extrabold rounded-xl transition-all flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.5)] shrink-0 text-[10px] tracking-wider uppercase animate-pulse"
            title="Auto-Pilot Roaming"
          >
            <Compass className="w-3.5 h-3.5 text-slate-950" />
            <span>Auto-Pilot</span>
          </button>

          <button
            onClick={toggleClusterRotateMode}
            className={`px-2 py-1 rounded-xl transition-all flex items-center gap-1 border shrink-0 text-[10px] ${
              clusterRotateMode
                ? "bg-indigo-500 text-slate-950 border-indigo-400 font-extrabold shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-pulse"
                : "hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 border-transparent hover:border-indigo-500/40"
            }`}
            title={`Cluster Axis Rotation Mode (${clusterRotateMode ? "ACTIVE" : "OFF"})`}
          >
            <Orbit className={`w-3.5 h-3.5 ${clusterRotateMode ? "text-slate-950 animate-spin" : "text-indigo-400"}`} />
            <span className="hidden lg:inline">Rotate Cluster</span>
          </button>

          {hasRotatedAxis && (
            <button
              onClick={handleResetClusterAxis}
              className="px-2 py-1 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 rounded-xl transition-all flex items-center gap-1 border border-indigo-500/40 hover:border-indigo-500/60 shrink-0 text-[10px] animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.3)]"
              title="Reset Cluster 3D Rotation Axis back to default (0, 0, 0)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Reset Axis</span>
            </button>
          )}
        </div>

        {/* Pod 2: Neural Physics & Simulation (Glassmorphic Group) */}
        <div className="flex items-center gap-1.5 p-1.5 sm:p-2 bg-slate-950/80 border border-indigo-500/30 rounded-2xl shadow-[0_0_25px_rgba(99,102,241,0.15)] backdrop-blur-xl pointer-events-auto overflow-x-auto no-scrollbar max-w-full">
          {/* Secondary Buttons: Smaller, borderless, clean */}
          <button
            onClick={() => onTriggerCameraShot?.("zenOrbit")}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 shrink-0 text-[9px] uppercase tracking-wider ${
              zenOrbitActive
                ? "bg-emerald-500/30 text-emerald-300 font-bold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title="Zen-Orbit Mode"
          >
            <Sparkles className={`w-3 h-3 ${zenOrbitActive ? "text-emerald-300 animate-spin" : "text-emerald-400"}`} />
            <span>Zen-Orbit</span>
          </button>

          <button
            onClick={() => setAdaptiveGeometryState(!isAdaptiveActive)}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 shrink-0 text-[9px] uppercase tracking-wider ${
              isAdaptiveActive
                ? "bg-purple-500/30 text-purple-300 font-bold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title={`Adaptive Geometry Mode (${isAdaptiveActive ? "ACTIVE" : "OFF"})`}
          >
            <Zap className={`w-3 h-3 ${isAdaptiveActive ? "text-purple-300" : "text-purple-400"}`} />
            <span>Adaptive Geo</span>
          </button>

          <button
            onClick={() => setLocalNeuralDecayMode(!isNeuralDecayActive)}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 shrink-0 text-[9px] uppercase tracking-wider ${
              isNeuralDecayActive
                ? "bg-amber-500/30 text-amber-300 font-bold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title={`Neural Decay Mode (${isNeuralDecayActive ? "ACTIVE" : "OFF"})`}
          >
            <Flame className={`w-3 h-3 ${isNeuralDecayActive ? "text-amber-300" : "text-amber-400"}`} />
            <span>Neural Decay</span>
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-0.5 shrink-0" />

          {/* HIGHLIGHTED PRIMARY BUTTON: Neural Burst */}
          {onTestNeuralBurst && (
            <button
              onClick={onTestNeuralBurst}
              className={`px-3 py-1 rounded-xl font-extrabold uppercase tracking-wider transition-all flex items-center gap-1 shadow-lg shrink-0 text-[10px] ${
                neuralBurst?.active
                  ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-bounce"
                  : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-slate-950 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
              }`}
              title="Simulate rapid signal transmission across synapse network"
            >
              <Flame className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span className="whitespace-nowrap">{neuralBurst?.active ? "BURSTING!" : "⚡ NEURAL BURST"}</span>
            </button>
          )}

          {onTestSynapticPathfinding && (
            <button
              onClick={onTestSynapticPathfinding}
              className={`px-2 py-1 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1 border shrink-0 text-[10px] ${
                synapticPathfinding?.active
                  ? "bg-purple-500 text-slate-950 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.9)] animate-pulse"
                  : "bg-purple-950/80 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
              }`}
              title="Test Synaptic Pathfinding"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
              <span className="whitespace-nowrap">{synapticPathfinding?.active ? "PATHFINDING!" : "🧠 PATHFINDING"}</span>
            </button>
          )}

          {Object.keys(localStorage.getItem("senpai_custom_node_pos_v1") || "").length > 2 && (
            <button
              onClick={() => {
                localStorage.removeItem("senpai_custom_node_pos_v1");
                window.location.reload();
              }}
              className="px-2 py-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded-xl transition-all flex items-center gap-1 border border-transparent hover:border-rose-500/40 shrink-0 text-[10px]"
              title="Reset manually dragged coordinates"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Reset Pos</span>
            </button>
          )}
        </div>
      </div>

      {/* Ghost POV Mode (Minimized / Unpinned Dock) */}
      {isGameModeActive && !isGhostPovPinned && (
        <div className="absolute bottom-20 left-4 z-40 bg-slate-950/90 border border-amber-500/60 rounded-2xl p-2.5 shadow-[0_0_25px_rgba(245,158,11,0.3)] backdrop-blur-xl flex items-center gap-3 text-white pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 font-mono font-extrabold text-xs text-amber-400 uppercase tracking-wider">
            <span className="text-base animate-bounce">🎮</span>
            <span>GHOST POV ACTIVE</span>
          </div>
          <button
            onClick={() => setIsGhostPovPinned(true)}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1"
            title="Expand & Pin Movement Controller Rig"
          >
            <Pin className="w-3 h-3" />
            <span>Pin Rig</span>
          </button>
          <button
            onClick={() => onToggleGameMode?.()}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all shadow flex items-center gap-1"
            title="Exit Ghost POV (Z)"
          >
            <span>Exit (Z)</span>
          </button>
        </div>
      )}

      {/* Ghost POV Game Mode HUD Overlay & Compact On-Screen Virtual Controller (Bottom-Left Corner) */}
      {isGameModeActive && isGhostPovPinned && (
        <div className="absolute bottom-20 left-4 z-40 bg-slate-950/90 border border-amber-500/80 rounded-2xl p-3 shadow-[0_0_35px_rgba(245,158,11,0.4)] backdrop-blur-xl flex flex-col items-center gap-2 text-white pointer-events-auto w-[340px] max-w-[90vw] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between w-full border-b border-amber-500/30 pb-1.5">
            <div className="flex items-center gap-1.5 font-mono font-extrabold text-xs text-amber-400 uppercase tracking-widest">
              <span className="text-sm animate-bounce">🎮</span>
              <span>POV Controller</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsGhostPovPinned(false)}
                className="p-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg text-[9px] font-mono transition-all border border-amber-500/30 flex items-center gap-1 px-1.5"
                title="Unpin / Minimize Controller"
              >
                <Pin className="w-3 h-3 rotate-45" />
                <span>Unpin</span>
              </button>
              <button
                onClick={() => onToggleGameMode?.()}
                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all shadow flex items-center gap-1"
                title="Exit Ghost POV (Z)"
              >
                <span>Exit (Z)</span>
              </button>
            </div>
          </div>

          {/* Compact Arrow Symbol Mapping Guide */}
          <div className="grid grid-cols-4 gap-1 w-full text-[9px] font-mono font-medium text-slate-300 text-center bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <div className="bg-slate-950 px-1 py-0.5 rounded border border-slate-800"><strong className="text-amber-400">↑ W</strong>: FWD</div>
            <div className="bg-slate-950 px-1 py-0.5 rounded border border-slate-800"><strong className="text-amber-400">↓ S</strong>: BACK</div>
            <div className="bg-slate-950 px-1 py-0.5 rounded border border-slate-800"><strong className="text-amber-400">← A</strong>: LEFT</div>
            <div className="bg-slate-950 px-1 py-0.5 rounded border border-slate-800"><strong className="text-amber-400">→ D</strong>: RIGHT</div>
            <div className="bg-slate-950 px-1 py-0.5 rounded border border-slate-800"><strong className="text-cyan-400">↖ Q</strong>: TURN L</div>
            <div className="bg-slate-950 px-1 py-0.5 rounded border border-slate-800"><strong className="text-cyan-400">↗ R</strong>: TURN R</div>
            <div className="bg-slate-950 px-1 py-0.5 rounded border border-slate-800"><strong className="text-emerald-400">⚡ SHIFT</strong>: SPEED</div>
            <div className="bg-slate-950 px-1 py-0.5 rounded border border-slate-800"><strong className="text-rose-400">Z</strong>: EXIT</div>
          </div>

          {/* Compact Virtual D-Pad / Arrow Buttons */}
          <div className="grid grid-cols-4 gap-1.5 w-full font-mono text-xs font-bold select-none">
            <button
              onMouseDown={() => (gameKeysRef.current["q"] = true)}
              onMouseUp={() => (gameKeysRef.current["q"] = false)}
              onMouseLeave={() => (gameKeysRef.current["q"] = false)}
              onTouchStart={(e) => { e.preventDefault(); gameKeysRef.current["q"] = true; }}
              onTouchEnd={() => (gameKeysRef.current["q"] = false)}
              className="bg-cyan-950/80 hover:bg-cyan-600 active:bg-cyan-500 text-cyan-200 border border-cyan-500/50 rounded-xl py-1.5 flex flex-col items-center justify-center transition-all active:scale-95 shadow"
              title="Turn Left (Q)"
            >
              <span className="text-sm">↖</span>
              <span className="text-[8px] tracking-tight">TURN L</span>
            </button>
            <button
              onMouseDown={() => (gameKeysRef.current["w"] = true)}
              onMouseUp={() => (gameKeysRef.current["w"] = false)}
              onMouseLeave={() => (gameKeysRef.current["w"] = false)}
              onTouchStart={(e) => { e.preventDefault(); gameKeysRef.current["w"] = true; }}
              onTouchEnd={() => (gameKeysRef.current["w"] = false)}
              className="bg-amber-950/80 hover:bg-amber-600 active:bg-amber-500 text-amber-200 border border-amber-500/50 rounded-xl py-1.5 flex flex-col items-center justify-center transition-all active:scale-95 shadow col-span-2"
              title="Move Forward / Up (W)"
            >
              <span className="text-sm">↑</span>
              <span className="text-[8px] tracking-tight">FORWARD</span>
            </button>
            <button
              onMouseDown={() => (gameKeysRef.current["r"] = true)}
              onMouseUp={() => (gameKeysRef.current["r"] = false)}
              onMouseLeave={() => (gameKeysRef.current["r"] = false)}
              onTouchStart={(e) => { e.preventDefault(); gameKeysRef.current["r"] = true; }}
              onTouchEnd={() => (gameKeysRef.current["r"] = false)}
              className="bg-cyan-950/80 hover:bg-cyan-600 active:bg-cyan-500 text-cyan-200 border border-cyan-500/50 rounded-xl py-1.5 flex flex-col items-center justify-center transition-all active:scale-95 shadow"
              title="Turn Right (R)"
            >
              <span className="text-sm">↗</span>
              <span className="text-[8px] tracking-tight">TURN R</span>
            </button>
            <button
              onMouseDown={() => (gameKeysRef.current["a"] = true)}
              onMouseUp={() => (gameKeysRef.current["a"] = false)}
              onMouseLeave={() => (gameKeysRef.current["a"] = false)}
              onTouchStart={(e) => { e.preventDefault(); gameKeysRef.current["a"] = true; }}
              onTouchEnd={() => (gameKeysRef.current["a"] = false)}
              className="bg-slate-900 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700 rounded-xl py-1.5 flex flex-col items-center justify-center transition-all active:scale-95 shadow"
              title="Strafe Left (A)"
            >
              <span className="text-sm">←</span>
              <span className="text-[8px] tracking-tight">LEFT</span>
            </button>
            <button
              onMouseDown={() => (gameKeysRef.current["s"] = true)}
              onMouseUp={() => (gameKeysRef.current["s"] = false)}
              onMouseLeave={() => (gameKeysRef.current["s"] = false)}
              onTouchStart={(e) => { e.preventDefault(); gameKeysRef.current["s"] = true; }}
              onTouchEnd={() => (gameKeysRef.current["s"] = false)}
              className="bg-amber-950/80 hover:bg-amber-600 active:bg-amber-500 text-amber-200 border border-amber-500/50 rounded-xl py-1.5 flex flex-col items-center justify-center transition-all active:scale-95 shadow col-span-2"
              title="Move Backward / Down (S)"
            >
              <span className="text-sm">↓</span>
              <span className="text-[8px] tracking-tight">BACKWARD</span>
            </button>
            <button
              onMouseDown={() => (gameKeysRef.current["d"] = true)}
              onMouseUp={() => (gameKeysRef.current["d"] = false)}
              onMouseLeave={() => (gameKeysRef.current["d"] = false)}
              onTouchStart={(e) => { e.preventDefault(); gameKeysRef.current["d"] = true; }}
              onTouchEnd={() => (gameKeysRef.current["d"] = false)}
              className="bg-slate-900 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700 rounded-xl py-1.5 flex flex-col items-center justify-center transition-all active:scale-95 shadow"
              title="Strafe Right (D)"
            >
              <span className="text-sm">→</span>
              <span className="text-[8px] tracking-tight">RIGHT</span>
            </button>
          </div>

          <button
            onMouseDown={() => (gameKeysRef.current["boost"] = true)}
            onMouseUp={() => (gameKeysRef.current["boost"] = false)}
            onMouseLeave={() => (gameKeysRef.current["boost"] = false)}
            onTouchStart={(e) => { e.preventDefault(); gameKeysRef.current["boost"] = true; }}
            onTouchEnd={() => (gameKeysRef.current["boost"] = false)}
            className="w-full py-1.5 px-3 bg-emerald-950/80 hover:bg-emerald-600 active:bg-emerald-500 text-emerald-300 border border-emerald-500/50 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow active:scale-95 select-none"
          >
            <span>⚡ HOLD FOR SPEED BOOST (SHIFT)</span>
          </button>
        </div>
      )}
    </div>
  );
};
