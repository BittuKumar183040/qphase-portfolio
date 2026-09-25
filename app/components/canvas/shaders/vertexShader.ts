
import { WAVE_LAYERS, MAX_RIPPLES, WAVE_ACTIVE_THRESHOLD, FADE_START, FADE_END } from "../waveConfig";

export function buildVertexShader(): string {
  const N_LAYERS = WAVE_LAYERS.length;
  const N_RIPPLES = MAX_RIPPLES;

  return `
    #define PI 3.14159265359
    #define N_LAYERS ${N_LAYERS}
    #define N_RIPPLES ${N_RIPPLES}

    uniform float uTime;

    uniform vec2  uWaveDir[N_LAYERS];
    uniform float uWaveK[N_LAYERS];
    uniform float uWaveAmp[N_LAYERS];
    uniform float uWaveSpeed[N_LAYERS];
    uniform float uWaveSteepness[N_LAYERS];

    uniform vec2  uRippleOrigin[N_RIPPLES];
    uniform float uRippleStart[N_RIPPLES];
    uniform float uRippleAmp[N_RIPPLES];
    uniform float uRippleSpeed[N_RIPPLES];
    uniform float uRippleK[N_RIPPLES];
    uniform float uRippleBand[N_RIPPLES];
    uniform float uRippleDamp[N_RIPPLES];
    uniform float uRippleSpreadDecay;
    uniform int   uRippleCount;

    uniform float uSizeMin;
    uniform float uSizeMax;
    uniform float uSizeScaleFactor;
    uniform float uDprSizeMultiplier;

    uniform vec2 uPointerWorld;
    uniform float uPointerRadius;
    uniform float uPointerStrength;

    attribute float aJitter;
    attribute float aDepthT;

    varying float vHeight;
    varying float vDepthFade;
    varying float vIsActive;
    varying float vIsCrest;
    varying float vFoam;
    varying float vLight;

    float rippleHeight(vec2 p) {
      float h = 0.0;
      for (int i = 0; i < N_RIPPLES; i++) {
        if (i >= uRippleCount) break;
        float age = uTime - uRippleStart[i];
        if (age <= 0.0) continue;

        float dist = distance(p, uRippleOrigin[i]);
        float front = age * uRippleSpeed[i];
        float d = dist - front;

        float envelope = exp(-(d * d) / (2.0 * uRippleBand[i] * uRippleBand[i]));
        float amp = uRippleAmp[i]
          * exp(-age * uRippleDamp[i])
          / (1.0 + dist * uRippleSpreadDecay);

        h += amp * envelope * cos(dist * uRippleK[i] - age * uRippleSpeed[i] * uRippleK[i]);
      }
      return h;
    }

    vec3 gerstnerDisplace(vec2 p) {
      vec3 d = vec3(0.0);
      for (int i = 0; i < N_LAYERS; i++) {
        vec2 dir = uWaveDir[i];
        float k = uWaveK[i];
        float phase = k * dot(dir, p) - uWaveSpeed[i] * k * uTime;
        float c = cos(phase);
        float s = sin(phase);
        float q = uWaveSteepness[i] / (k * uWaveAmp[i] * float(N_LAYERS));
        d.x += q * uWaveAmp[i] * dir.x * c;
        d.z += q * uWaveAmp[i] * dir.y * c;
        d.y += uWaveAmp[i] * s;
      }
      return d;
    }

    float pointerBump(vec2 p) {
      float d = distance(p, uPointerWorld);
      return uPointerStrength * exp(-(d * d) / (2.0 * uPointerRadius * uPointerRadius));
    }

    vec3 totalDisplace(vec2 p) {
      vec3 d = gerstnerDisplace(p);
      d.y += rippleHeight(p);
      d.y += pointerBump(p);
      return d;
    }

    void main() {
      vec2 p = position.xz;

      float eps = 0.35;
      vec3 d0 = totalDisplace(p);
      vec3 dx = totalDisplace(p + vec2(eps, 0.0));
      vec3 dz = totalDisplace(p + vec2(0.0, eps));

      vec3 p0 = vec3(position.x, 0.0, position.z) + d0;
      vec3 px = vec3(position.x + eps, 0.0, position.z) + dx;
      vec3 pz = vec3(position.x, 0.0, position.z + eps) + dz;

      vec3 tangentX = (px - p0) / eps;
      vec3 tangentZ = (pz - p0) / eps;
      vec3 normal = normalize(cross(tangentZ, tangentX));

      float jacobian = (1.0 + tangentX.x) * (1.0 + tangentZ.z) - tangentX.z * tangentZ.x;
      float foam = clamp(1.0 - jacobian, 0.0, 1.0);
      foam = pow(foam, 1.6);

      float h = d0.y;
      vHeight = h;
      vFoam = foam;
      vIsCrest = step(0.0, h);
      vIsActive = step(${WAVE_ACTIVE_THRESHOLD.toFixed(3)}, abs(h));

      vec3 lightDir = normalize(vec3(0.35, 0.85, 0.3));
      float diffuse = max(dot(normal, lightDir), 0.2);
      vec3 viewDirApprox = normalize(vec3(0.0, 0.6, -1.0));
      float specular = pow(max(dot(reflect(-lightDir, normal), viewDirApprox), 0.0), 20.0);
      vLight = diffuse + specular * 0.6;

      vec3 displaced = p0;
      vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);

      float dist = -mvPosition.z;
      vDepthFade = 1.0 - smoothstep(${FADE_START.toFixed(2)}, ${FADE_END.toFixed(2)}, dist);

      float keepProb = max(0.3, vDepthFade);
      if (aJitter > keepProb && aDepthT > 0.75) {
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        gl_PointSize = 0.0;
        return;
      }

      float sizeFromDepth = uSizeScaleFactor / max(dist, 0.001);
      float pointSize = clamp(sizeFromDepth, uSizeMin, uSizeMax);
      pointSize *= 1.0 + foam * 0.6;

      gl_PointSize = pointSize * uDprSizeMultiplier;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
}