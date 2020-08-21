precision highp float;
varying vec2 vUv;
uniform sampler2D ptTex;

void main() {
  vec3 c = texture2D(ptTex, vUv.st).rgb;
  gl_FragColor = vec4(c, 1.0);
}
