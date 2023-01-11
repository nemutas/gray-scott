uniform sampler2D tDefault;
uniform bool u_useDefault;
uniform float u_du;
uniform float u_dv;
uniform float u_f;
uniform float u_k;
uniform float u_dt;
uniform float u_dx;
uniform vec2 u_px;
uniform vec2 u_mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
 
  vec2 left_uv   = texture2D(tGrayScott, uv - vec2(u_px.x, 0.0)).xy;
  vec2 right_uv  = texture2D(tGrayScott, uv + vec2(u_px.x, 0.0)).xy;
  vec2 top_uv    = texture2D(tGrayScott, uv - vec2(0.0, u_px.y)).xy;
  vec2 bottom_uv = texture2D(tGrayScott, uv + vec2(0.0, u_px.y)).xy;
  vec2 center_uv = texture2D(tGrayScott, uv).xy;

  vec2 laplacian = (left_uv + right_uv + top_uv + bottom_uv - 4.0 * center_uv) / (u_dx * u_dx);

  float u = center_uv.x;
  float v = center_uv.y;
  float dudt = u_du * laplacian.x - u * v * v + u_f * (1.0 - u);
  float dvdt = u_dv * laplacian.y + u * v * v - (u_f + u_k) * v;

  u += u_dt * dudt;
  v += u_dt * dvdt;

  vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
  float dist = distance((u_mouse * 0.5 + 0.5) * aspect, uv * aspect);
  dist = smoothstep(0.01, 0.03, dist);
  if (dist < 1.0) {
    v = 0.5;
  }

  vec4 result = vec4(u, v, 0.0, dist);
  if (u_useDefault) {
    result = texture2D(tDefault, uv);
  }
  
  gl_FragColor = result;
}