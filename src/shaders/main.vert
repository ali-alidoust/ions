precision highp float;
uniform sampler2D texX;
uniform sampler2D texV;
uniform sampler2D texP;

uniform float texDim;
varying vec3 vColor;

attribute float bodyIndex;

const vec3 negativeColor = vec3(1.0, 0.0, 1.0);
const vec3 neutralColor = vec3(1.0, 1.0, 1.0);
const vec3 positiveColor = vec3(0.0, 1.0, 1.0);

void main() {
  vec2 bodyLookup = vec2(mod(bodyIndex, texDim) / texDim, floor(bodyIndex / texDim) / texDim);
  vec3 X = texture2D(texX, bodyLookup).xyz;
  vec3 P = texture2D(texP, bodyLookup).xyz;
  // float h = 0.5;
  // float normalizedCharge = (P.y + 1.0) / 2.0;
  // vColor = mix(mix(negativeColor, neutralColor, normalizedCharge/h),
  // mix(neutralColor, positiveColor, (normalizedCharge - h)/(1.0 - h)), step(h,
  // normalizedCharge));
  vec3 color = mix(negativeColor, neutralColor, smoothstep(-1.0, 0.0, P.y));
  vColor = mix(color, positiveColor, smoothstep(0.0, 1.0, P.y));
  // vec3 V = texture2D(texV, bodyLookup).xyz;

  // vec3 VNorm = normalize(V);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz + X, 1.0);
}
