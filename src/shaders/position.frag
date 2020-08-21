precision highp float;
varying vec2 vUv;
uniform sampler2D texX; // Positions
uniform sampler2D texV; // Velocities
uniform float dt;       // Delta time

void main() {
  vec3 currX = texture2D(texX, vUv.xy).xyz;
  vec3 currV = texture2D(texV, vUv.xy).xyz;
  gl_FragColor = vec4(currX + currV * dt, 1.0);
}
