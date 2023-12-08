precision highp float;
in vec2 vUv;
uniform sampler2D texS; // Positions
uniform sampler2D texV; // Velocities
uniform float dt;       // Delta time
out vec4 fragColor;

void main() {
  vec3 currS = texture(texS, vUv.xy).xyz;
  vec3 currV = texture(texV, vUv.xy).xyz;
  fragColor = vec4(currS + currV * dt, 1.0);
}
