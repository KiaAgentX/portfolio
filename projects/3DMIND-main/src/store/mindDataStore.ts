// File: src/store/mindDataStore.ts

import { create } from 'zustand';
import { eventBus } from '../engine/eventBus';

export type NodeType = 'TP' | 'SL' | 'Chat' | 'Debug' | 'Media';

export interface MindNode {
  id: string;
  type: NodeType;
  color: string;
  position: [number, number, number]; // 3D coordinates
  createdAt: string;
  label: string;
  details?: string;
  link?: string;
  image?: string;
}

export interface MindConnection {
  from: string;
  to: string;
}

interface MindState {
  nodes: MindNode[];
  connections: MindConnection[];
  addNode: (type: NodeType, color?: string, info?: { label: string; details?: string; link?: string; image?: string }) => MindNode;
  updateNode: (id: string, updates: Partial<MindNode>) => void;
  addConnection: (from: string, to: string) => void;
  clearAll: () => void;
}

// Generate sequential IDs
let nodeIdCounter = 1;

export const useMindDataStore = create<MindState>((set, get) => ({
  nodes: [],
  connections: [],

  addNode: (type, color, info) => {
    const id = `node_${type}_${nodeIdCounter++}_${Date.now()}`;
    
    // Default color map if none is specified
    const defaultColorMap: Record<NodeType, string> = {
      TP: '#00FF00',
      SL: '#FF0000',
      Chat: '#0088FF',
      Debug: '#FFFFFF',
      Media: '#FF00FF'
    };
    const nodeColor = color || defaultColorMap[type] || '#FFFFFF';

    // Auto-assign position using a spiral layout in 3D around the center
    const currentNodes = get().nodes;
    const count = currentNodes.length;
    
    // Spiral mapping
    const angle = count * 0.75;
    const radius = 2.5 + count * 0.45;
    
    const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 1.0;
    const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 1.0;
    const z = (Math.random() - 0.5) * 4.0; // depth distribution

    const newNode: MindNode = {
      id,
      type,
      color: nodeColor,
      position: [x, y, z],
      createdAt: new Date().toISOString(),
      label: info?.label || `${type} Node`,
      details: info?.details,
      link: info?.link,
      image: info?.image
    };

    set((state) => ({
      nodes: [...state.nodes, newNode]
    }));

    // Trigger eventBus event for the new node creation
    eventBus.emit('node-created', {
      type,
      id,
      color: nodeColor,
      position: [x, y, z],
      node: newNode
    });

    // Automatically connect new node to the last node of the same type if exists, to build a mind cloud
    const lastNodeOfSameType = [...currentNodes].reverse().find(n => n.type === type);
    if (lastNodeOfSameType) {
      get().addConnection(lastNodeOfSameType.id, id);
    } else if (currentNodes.length > 0) {
      // Otherwise, connect to the center or first node to keep the tree connected
      get().addConnection(currentNodes[0].id, id);
    }

    return newNode;
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) => 
        node.id === id ? { ...node, ...updates } : node
      )
    }));
  },

  addConnection: (from, to) => {
    // Check if connection already exists to prevent duplicates
    const exists = get().connections.some(c => (c.from === from && c.to === to) || (c.from === to && c.to === from));
    if (exists || from === to) return;

    set((state) => ({
      connections: [...state.connections, { from, to }]
    }));
  },

  clearAll: () => {
    set({ nodes: [], connections: [] });
    eventBus.emit('debug-log', {
      message: 'Mind Cloud cleared.',
      type: 'Debug',
      timestamp: new Date().toISOString()
    });
    eventBus.emit('build-new-node', { type: 'Debug', color: '#FFFFFF' });
  }
}));
