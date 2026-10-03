export type SimulationMode = 'academic' | 'scifi' | 'classified';

export type ActivePreset = 'electrogravitics' | 'quantum_levitation' | 'alcubierre_metric' | 'custom';

export interface SimulationVariables {
  mass: number;         // in kg
  negativeEnergy: number; // in MJ
  frequency: number;    // in Hz
  distance: number;     // in meters
}

export interface MetricData {
  time: string;
  gmi: number;
  stability: number;
  negativeDensity: number;
  power: number;
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'historical' | 'military' | 'classified' | 'modern';
  milestone: string;
}

export interface ClassifiedDoc {
  id: string;
  codeName: string;
  title: string;
  level: 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET';
  date: string;
  origin: string;
  redactedExcerpt: string;
  blueprintType: 'biefeld' | 'tesla' | 'alcubierre';
  details: string[];
}
