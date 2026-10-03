import { TimelineItem, ClassifiedDoc, SimulationVariables } from './types';

export const PRESET_VARIABLES: Record<string, SimulationVariables> = {
  electrogravitics: {
    mass: 120,
    negativeEnergy: 450,
    frequency: 85000,
    distance: 1.2,
  },
  quantum_levitation: {
    mass: 15,
    negativeEnergy: 120,
    frequency: 1250000,
    distance: 0.15,
  },
  alcubierre_metric: {
    mass: 88000,
    negativeEnergy: 9800,
    frequency: 54000000,
    distance: 45.0,
  },
  custom: {
    mass: 50,
    negativeEnergy: 200,
    frequency: 100000,
    distance: 1.0,
  }
};

export const HISTORICAL_TIMELINE: TimelineItem[] = [
  {
    id: 't1',
    year: '1915',
    title: 'General Relativity Foundations',
    subtitle: 'Albert Einstein',
    description: 'Einstein publishes the Field Equations, linking mass and space-time geometry. His mathematical models establish that space can be warped, opening theoretical pathways to bending gravity.',
    category: 'historical',
    milestone: 'Space-time warp theory mathematically authorized.'
  },
  {
    id: 't2',
    year: '1928',
    title: 'Dynamic Theory of Gravity',
    subtitle: 'Nikola Tesla',
    description: 'Tesla registers files claiming to have solved the relationship between electromagnetic radiation and gravity. He details an Electro-Gravitic propulsion system powered by terrestrial resonance.',
    category: 'classified',
    milestone: 'U.S. Patent archives marked classified in late 1943.'
  },
  {
    id: 't3',
    year: '1952',
    title: 'Project Winterhaven',
    subtitle: 'Townsend Brown & USAF',
    description: 'Thomas Townsend Brown presents the Biefeld-Brown Effect: applying heavy voltage to asymmetrical capacitors generates a net physical force toward the small electrode. Project Winterhaven is drafted to develop anti-gravity fighter craft.',
    category: 'military',
    milestone: 'Electrohydrodynamic military research initiates.'
  },
  {
    id: 't4',
    year: '1994',
    title: 'Alcubierre Warp Metric',
    subtitle: 'Miguel Alcubierre',
    description: 'A mathematical proof demonstrates that space-time can be compressed ahead of a vessel and expanded behind it, allowing faster-than-light travel without violating local relativity—provided negative mass-energy exists.',
    category: 'historical',
    milestone: 'Theoretical formulation of negative energy shields.'
  },
  {
    id: 't5',
    year: '2026',
    title: 'Casimir Field Manipulation',
    subtitle: 'Apex Laboratories',
    description: 'Breakthrough quantum experiments achieve localized Casimir vacuum cavities, resulting in measurable macroscopic negative energy density nodes—matching the requirements for high-frequency gravitational repulsion.',
    category: 'modern',
    milestone: 'First functional laboratory-grade quantum levitation core.'
  }
];

export const CLASSIFIED_DOCUMENTS: ClassifiedDoc[] = [
  {
    id: 'doc-bb-01',
    codeName: 'CODENAME: WINTERHAVEN',
    title: 'Biefeld-Brown Asymmetric Propulsion Scheme',
    level: 'TOP SECRET',
    date: 'OCTOBER 24, 1956',
    origin: 'WRIGHT-PATTERSON AFB / RESEARCH LABS',
    redactedExcerpt: 'The applied [REDACTED] potential of approximately 150 Kilovolts across the asymmetrical conductive plating of the disc [REDACTED] creates a localized gravitational displacement field. Measurements indicate a steady [REDACTED]% reduction in local net mass vector...',
    blueprintType: 'biefeld',
    details: [
      'High-voltage corona discharge ionization of ambient atmosphere creates asymmetric vector thrust.',
      'Recommended dielectric coefficient material exceeding K=12000.',
      'Potential hazard: Hard X-ray emission during electromagnetic flux coupling.'
    ]
  },
  {
    id: 'doc-nt-88',
    codeName: 'CODENAME: TESLA-CORE',
    title: 'Terrestrial Gravity Resonator',
    level: 'SECRET',
    date: 'JULY 11, 1934',
    origin: 'WARDENCLYFFE CLASSIFIED LOGS',
    redactedExcerpt: 'By utilizing a localized high-frequency primary coil tuned to the earth\'s electrostatic [REDACTED] mechanical resonance, we can reverse the downward vector of gravity. The electrical displacement of [REDACTED] creates an intense ethereal scalar field that excludes heavy mass matrices...',
    blueprintType: 'tesla',
    details: [
      'Resonance frequency set to Earth base crust wavelength (11.8 Hz harmonics).',
      'Requires heavy liquid mercury toroidal conductor for inertial dampening.',
      'Tested successfully on small copper objects over 4.5 meters vertical distance.'
    ]
  },
  {
    id: 'doc-am-99',
    codeName: 'CODENAME: ALCUBIERRE-CORE',
    title: 'Negative Energy Spacetime Distorter (Warp Ring)',
    level: 'TOP SECRET',
    date: 'DECEMBER 09, 2018',
    origin: 'APEX QUANTUM ARCHIVES',
    redactedExcerpt: 'In order to satisfy the Alcubierre field tensor, a dual-ring system generating [REDACTED] Mega-Joules of Negative Mass Density must be placed perpendicular to the primary [REDACTED] corridor. This compresses space-time in the bow and dilates space-time in the stern of the vessel, isolating the capsule from local inertial forces...',
    blueprintType: 'alcubierre',
    details: [
      'Requires continuous feed of negative energy sourced from CASIMIR laser arrays.',
      'Stabilization field must maintain a cohesion coefficient above 0.998 to prevent microscopic black hole decay.',
      'Aero-elastic stress eliminated. Thermal temperature inside the bubble remains 18°C.'
    ]
  }
];
