export function buildFragmentShader(): string {
  return /* glsl */ `
    precision mediump float;

    uniform vec3 uMajorColor;
    uniform vec3 uTopColor;
    uniform float uBaseAlpha;
    uniform float uCrestAlpha;
    uniform float uFoamThreshold;
    uniform float uUseGradient; // 0.0 = hard cutoff, 1.0 = soft gradient
    uniform float uGradientSoftness;

    varying float vHeight;
    varying float vDepthFade;
    varying float vIsActive;
    varying float vIsCrest;
    varying float vFoam;
    varying float vLight;

    void main() {
      vec2 uv = gl_PointCoord * 2.0 - 1.0;
      float thickness = 0.22;

      float horiz = 1.0 - smoothstep(thickness, thickness + 0.15, abs(uv.y));
      float inXRange = step(-1.0, uv.x) * step(uv.x, 1.0);
      float horizLine = horiz * inXRange;

      float vert = 1.0 - smoothstep(thickness, thickness + 0.15, abs(uv.x));
      float inYRange = step(-1.0, uv.y) * step(uv.y, 1.0);
      float vertLine = vert * inYRange * vIsCrest;

      float shape = max(horizLine, vertLine);
      if (shape <= 0.001) discard;

      // hard cutoff (step) or soft blend (smoothstep) around the threshold,
      // chosen by uUseGradient -- everything else about the shader is identical
      float isTop = mix(
        step(uFoamThreshold, vHeight),
        smoothstep(uFoamThreshold - uGradientSoftness, uFoamThreshold + uGradientSoftness, vHeight),
        uUseGradient
      );
      vec3 color = mix(uMajorColor, uTopColor, isTop);
      color *= vLight;

      float alphaCap = mix(uBaseAlpha, uCrestAlpha, isTop);
      float alpha = shape * vDepthFade * alphaCap;

      if (alpha <= 0.003) discard;
      gl_FragColor = vec4(color, alpha);
    }
  `;
}