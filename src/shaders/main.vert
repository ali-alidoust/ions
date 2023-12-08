precision highp float;
uniform sampler2D texS;
uniform sampler2D texV;
uniform sampler2D texP;

uniform float texDim;
out vec3 vColor;

in float bodyIndex;

const vec3 negativeColor = vec3(1.0, 0.0, 1.0);
const vec3 neutralColor = vec3(1.0, 1.0, 1.0);
const vec3 positiveColor = vec3(0.0, 1.0, 1.0);

void main() {
  vec2 bodyLookup = vec2(mod(bodyIndex, texDim) / texDim, floor(bodyIndex / texDim) / texDim);
  vec3 S = texture(texS, bodyLookup).xyz;
  vec3 P = texture(texP, bodyLookup).xyz;
  vec3 color = mix(negativeColor, neutralColor, smoothstep(-1.0, 0.0, P.y));
  vColor = mix(color, positiveColor, smoothstep(0.0, 1.0, P.y));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz + S, 1.0);
}
