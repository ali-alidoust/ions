precision highp float;

in vec2 vUv;
uniform sampler2D ptTex;
out vec4 fragColor;

void main() {
  vec3 c = texture(ptTex, vUv).rgb;
  fragColor = vec4(c, 1.0);
}
