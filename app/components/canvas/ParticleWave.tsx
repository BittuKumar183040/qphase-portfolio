"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  ROWS,
  COLS,
  WORLD_WIDTH,
  DEPTH_RANGE,
  Z_NEAR,
  Z_FAR,
  FOV,
  WAVE_LAYERS,
  RIPPLE,
  MAX_RIPPLES,
  FOAM_HEIGHT_THRESHOLD,
  USE_GRADIENT,
  GRADIENT_SOFTNESS,
  COLORS,
  BASE_ALPHA,
  CREST_ALPHA,
  FADE_END,
  PARTICLE,
  POINTER,
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_TARGET,
} from "./waveConfig"; // adjust path to match your folder layout
import { buildVertexShader } from "./shaders/vertexShader";
import { buildFragmentShader } from "./shaders/fragmentShader";

interface ParticleWaveProps {
  /**
   * Global speed multiplier for the entire wave system (swell + ripples).
   * 1 = normal speed, 0.5 = half speed, 2 = double speed, 0 = frozen.
   * Can be changed live — no remount required.
   */
  speed?: number;
  /**
   * false (default) = hard color cutoff at FOAM_HEIGHT_THRESHOLD.
   * true = soft gradient blend around the threshold (width = GRADIENT_SOFTNESS).
   * Can be changed live — no remount required.
   */
  gradient?: boolean;
  /**
   * Camera position in world units, e.g. { x: 0, y: 8, z: -4 }.
   * Defaults to DEFAULT_CAMERA_POSITION from waveConfig.ts.
   * Can be changed live — no remount required.
   */
  cameraPosition?: { x: number; y: number; z: number };
  /**
   * World-space point the camera looks at. Defaults to DEFAULT_CAMERA_TARGET.
   * Can be changed live — no remount required.
   */
  cameraTarget?: { x: number; y: number; z: number };
  /**
   * Enable/disable the pointer-follows-a-bump interaction. Default true.
   */
  pointerInteraction?: boolean;
}

const [defaultCamX, defaultCamY, defaultCamZ] = DEFAULT_CAMERA_POSITION;
const [defaultTargetX, defaultTargetY, defaultTargetZ] = DEFAULT_CAMERA_TARGET;

export const ParticleWave = ({
  speed = 1,
  gradient = USE_GRADIENT,
  cameraPosition = { x: defaultCamX, y: defaultCamY, z: defaultCamZ },
  cameraTarget = { x: defaultTargetX, y: defaultTargetY, z: defaultTargetZ },
  pointerInteraction = true,
}: ParticleWaveProps) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  // Refs (not state) so changing these props doesn't re-trigger the whole
  // scene-setup effect below — the render loop / uniforms just read the
  // latest value.
  const speedRef = useRef(speed);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointerEnabledRef = useRef(pointerInteraction);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uUseGradient.value = gradient ? 1 : 0;
    }
  }, [gradient]);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
      cameraRef.current.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z);
    }
  }, [cameraPosition.x, cameraPosition.y, cameraPosition.z, cameraTarget.x, cameraTarget.y, cameraTarget.z]);

  useEffect(() => {
    pointerEnabledRef.current = pointerInteraction;
  }, [pointerInteraction]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      FOV,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z);
    cameraRef.current = camera;

    const positions = new Float32Array(ROWS * COLS * 3);
    const jitters = new Float32Array(ROWS * COLS);
    const depthTs = new Float32Array(ROWS * COLS);
    let idx = 0;
    let vi = 0;
    for (let r = 0; r < ROWS; r++) {
      const tRow = r / (ROWS - 1);
      const z = Z_NEAR * Math.pow(Z_FAR / Z_NEAR, tRow);
      for (let c = 0; c < COLS; c++) {
        const x = (c / (COLS - 1) - 0.5) * WORLD_WIDTH;
        positions[idx++] = x;
        positions[idx++] = 0;
        positions[idx++] = z;
        jitters[vi] = ((c * 928371 + r * 12197) % 1000) / 1000;
        depthTs[vi] = tRow;
        vi++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aJitter", new THREE.BufferAttribute(jitters, 1));
    geometry.setAttribute("aDepthT", new THREE.BufferAttribute(depthTs, 1));

    const waveDir = WAVE_LAYERS.map((l) =>
      new THREE.Vector2(l.direction[0], l.direction[1]).normalize()
    );
    const waveK = WAVE_LAYERS.map((l) => (2 * Math.PI) / l.wavelength);
    const waveAmp = WAVE_LAYERS.map((l) => l.amplitude);
    const waveSpeed = WAVE_LAYERS.map((l) => l.speed);
    const waveSteepness = WAVE_LAYERS.map((l) => l.steepness);

    const rippleOrigin = new Array(MAX_RIPPLES)
      .fill(0)
      .map(() => new THREE.Vector2(0, 0));
    const rippleStart = new Array(MAX_RIPPLES).fill(-1e6);
    const rippleAmp = new Array(MAX_RIPPLES).fill(0);
    const rippleSpeed = new Array(MAX_RIPPLES).fill(0);
    const rippleK = new Array(MAX_RIPPLES).fill(0);
    const rippleBand = new Array(MAX_RIPPLES).fill(0);
    const rippleDamp = new Array(MAX_RIPPLES).fill(0);

    const material = new THREE.ShaderMaterial({
      vertexShader: buildVertexShader(),
      fragmentShader: buildFragmentShader(),
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },

        uWaveDir: { value: waveDir },
        uWaveK: { value: waveK },
        uWaveAmp: { value: waveAmp },
        uWaveSpeed: { value: waveSpeed },
        uWaveSteepness: { value: waveSteepness },

        uRippleOrigin: { value: rippleOrigin },
        uRippleStart: { value: rippleStart },
        uRippleAmp: { value: rippleAmp },
        uRippleSpeed: { value: rippleSpeed },
        uRippleK: { value: rippleK },
        uRippleBand: { value: rippleBand },
        uRippleDamp: { value: rippleDamp },
        uRippleSpreadDecay: { value: RIPPLE.spreadDecay },
        uRippleCount: { value: 0 },

        uSizeMin: { value: PARTICLE.sizeMin },
        uSizeMax: { value: PARTICLE.sizeMax },
        uSizeScaleFactor: { value: PARTICLE.sizeScaleFactor },
        uDprSizeMultiplier: { value: Math.min(window.devicePixelRatio || 1, 2) },

        uMajorColor: { value: new THREE.Color(...COLORS.major) },
        uTopColor: { value: new THREE.Color(...COLORS.top) },
        uBaseAlpha: { value: BASE_ALPHA },
        uCrestAlpha: { value: CREST_ALPHA },
        uFoamThreshold: { value: FOAM_HEIGHT_THRESHOLD },
        uUseGradient: { value: gradient ? 1 : 0 },
        uGradientSoftness: { value: GRADIENT_SOFTNESS },

        uPointerWorld: { value: new THREE.Vector2(1e6, 1e6) },
        uPointerRadius: { value: POINTER.radius },
        uPointerStrength: { value: 0 },
      },
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    materialRef.current = material;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      material.uniforms.uDprSizeMultiplier.value = Math.min(
        window.devicePixelRatio || 1,
        2
      );
    };
    window.addEventListener("resize", resize);
    resize();

    // --- pointer interaction: raycast the cursor onto the y=0 water plane,
    // smoothly follow it, and fade the effect in/out on enter/leave ---
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2(1e6, 1e6);
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const pointerHit = new THREE.Vector3();
    const pointerWorldTarget = new THREE.Vector2(1e6, 1e6);
    const pointerWorldSmoothed = new THREE.Vector2(1e6, 1e6);
    let pointerActiveTarget = 0;
    let pointerActiveSmoothed = 0;
    let pointerHasEnteredOnce = false;

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerEnabledRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNDC, camera);
      if (raycaster.ray.intersectPlane(groundPlane, pointerHit)) {
        pointerWorldTarget.set(pointerHit.x, pointerHit.z);
        if (!pointerHasEnteredOnce) {
          // snap on first contact so we don't lerp in from the far-away
          // (1e6, 1e6) initial value and produce a giant one-frame bump
          pointerWorldSmoothed.copy(pointerWorldTarget);
          pointerHasEnteredOnce = true;
        }
        pointerActiveTarget = 1;
      }
    };
    const onPointerLeave = () => {
      pointerActiveTarget = 0;
    };
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerleave", onPointerLeave);

    type Ripple = {
      origin: THREE.Vector2;
      start: number;
      amp: number;
      speed: number;
      k: number;
      band: number;
      damp: number;
    };
    let ripples: Ripple[] = [];

    const rand = (range: [number, number]) =>
      range[0] + Math.random() * (range[1] - range[0]);

    const makeRipple = (time: number): Ripple => ({
      origin: new THREE.Vector2(
        (Math.random() - 0.5) * WORLD_WIDTH,
        Math.random() * DEPTH_RANGE * 0.9 + Z_NEAR
      ),
      start: time,
      amp: rand(RIPPLE.amplitude),
      speed: rand(RIPPLE.speed),
      k: rand(RIPPLE.waveNumber),
      band: rand(RIPPLE.bandWidth),
      damp: rand(RIPPLE.damping),
    });

    const spawnRipple = (time: number) => {
      ripples.push(makeRipple(time));
      if (ripples.length > MAX_RIPPLES) ripples.shift();
    };

    const maxRippleSpeed = RIPPLE.speed[1];
    const RIPPLE_LIFETIME = FADE_END / maxRippleSpeed;
    const PRESEED_COUNT = 18;
    for (let i = 0; i < PRESEED_COUNT; i++) {
      const lifeFraction = i / (PRESEED_COUNT - 1);
      const startTime = -lifeFraction * RIPPLE_LIFETIME * 0.92;
      spawnRipple(startTime);
    }

    let t = 0;
    let nextSpawnAt = 0;
    let rafId = 0;
    let lastFrameTime = performance.now();

    const draw = () => {
      const now = performance.now();
      const rawDt = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;
      const dt = rawDt * speedRef.current;
      t += dt;

      // spawn cadence also scales with speed, so ripples arrive faster/slower
      // in step with the faster/slower wave motion instead of feeling out of sync
      if (t * 1000 >= nextSpawnAt) {
        spawnRipple(t);
        const interval =
          RIPPLE.minInterval + Math.random() * (RIPPLE.maxInterval - RIPPLE.minInterval);
        nextSpawnAt = t * 1000 + interval / Math.max(speedRef.current, 0.001);
      }

      ripples = ripples.filter((s) => (t - s.start) * s.speed < FADE_END);

      const count = Math.min(ripples.length, MAX_RIPPLES);
      for (let i = 0; i < count; i++) {
        const r = ripples[i];
        rippleOrigin[i].copy(r.origin);
        rippleStart[i] = r.start;
        rippleAmp[i] = r.amp;
        rippleSpeed[i] = r.speed;
        rippleK[i] = r.k;
        rippleBand[i] = r.band;
        rippleDamp[i] = r.damp;
      }
      for (let i = count; i < MAX_RIPPLES; i++) {
        rippleStart[i] = -1e6;
      }

      material.uniforms.uTime.value = t;
      material.uniforms.uRippleCount.value = count;

      // pointer bump: smoothly chase the raw target position/activity so it
      // doesn't snap, and fades out cleanly when pointerInteraction is off
      // or the pointer leaves the element
      const activeTarget = pointerEnabledRef.current ? pointerActiveTarget : 0;
      pointerActiveSmoothed += (activeTarget - pointerActiveSmoothed) * POINTER.fadeLerp;
      pointerWorldSmoothed.lerp(pointerWorldTarget, POINTER.followLerp);
      material.uniforms.uPointerWorld.value.copy(pointerWorldSmoothed);
      material.uniforms.uPointerStrength.value = POINTER.strength * pointerActiveSmoothed;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(rafId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      materialRef.current = null;
      cameraRef.current = null;
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div className="absolute inset-0 w-full h-full block" ref={mountRef} />;
};

export default ParticleWave;