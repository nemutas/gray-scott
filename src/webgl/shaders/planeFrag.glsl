uniform sampler2D tSimulator;
uniform vec2 u_uvScale;
varying vec2 v_uv;

void main() {
  vec2 uv = (v_uv - 0.5) * u_uvScale + 0.5;
  vec4 sim = texture2D(tSimulator, uv);
  float luma = smoothstep(0.0, 0.3, sim.g);
  float a = smoothstep(0.8, 1.0, sim.a);

  vec3 color = vec3(v_uv, 0.7);
  color *= luma;

  gl_FragColor = vec4(color, luma * a);
}