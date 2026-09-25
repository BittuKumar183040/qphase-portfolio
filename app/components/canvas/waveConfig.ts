export const ROWS = 200;
export const COLS = 220;

export const WORLD_WIDTH = 70;
export const DEPTH_RANGE = 100;
export const Z_NEAR = 1.5;
export const Z_FAR = DEPTH_RANGE;
export const CAM_HEIGHT = 6.5;
export const FOV = 45;

export const WAVE_LAYERS = [
  { direction: [1.0, 0.15], wavelength: 26, amplitude: 0.3, speed: 1.2, steepness: 0.45 },
  { direction: [0.25, 1.0], wavelength: 16, amplitude: 0.18, speed: 1.8, steepness: 0.4 },
  { direction: [-0.6, 0.45], wavelength: 9, amplitude: 0.11, speed: 1.6, steepness: 0.35 },
  { direction: [0.7, -0.4], wavelength: 4.5, amplitude: 0.055, speed: 2.6, steepness: 0.3 },
] as const;

export const RIPPLE = {
  minInterval: 380,
  maxInterval: 1000,
  amplitude: [0.35, 0.85] as [number, number],
  speed: [1, 4] as [number, number],
  waveNumber: [1.1, 2.1] as [number, number],
  bandWidth: [2.2, 4.2] as [number, number],
  damping: [0.09, 0.22] as [number, number],
  spreadDecay: 0.008,
};
export const MAX_RIPPLES = 32;

export const WAVE_ACTIVE_THRESHOLD = 0.22;
export const HEIGHT_NORMALIZE =
  WAVE_LAYERS.reduce((s, l) => s + l.amplitude, 0) + RIPPLE.amplitude[1];

export const COLORS = {
  major: [0.7, 0.5, 0.3] as [number, number, number],
  top: [0.6, 0.4, 0.2] as [number, number, number],
};

export const FOAM_HEIGHT_THRESHOLD = 0.4;
export const USE_GRADIENT = true;
export const GRADIENT_SOFTNESS = 0.15;

export const BASE_ALPHA = 0;
export const CREST_ALPHA = 0.9;

export const FADE_START = Z_FAR * 0.6;
export const FADE_END = Z_FAR * 1.02;

export const PARTICLE = {
  sizeMin: 2,
  sizeMax: 4,
  sizeScaleFactor: 240.0,
};

export const POINTER = {
  radius: 4.5, // world units — how wide the bump/dip is
  strength: 0.9, // peak height contribution at the pointer's exact position
  followLerp: 0.8, // 0..1, how quickly the bump chases the raw pointer position each frame (higher = snappier)
  fadeLerp: 0.8, // 0..1, how quickly the effect fades in/out when the pointer enters/leaves
};

export const DEFAULT_CAMERA_POSITION: [number, number, number] = [0, CAM_HEIGHT, 2];
export const DEFAULT_CAMERA_TARGET: [number, number, number] = [0, 0, DEPTH_RANGE * 0.45];