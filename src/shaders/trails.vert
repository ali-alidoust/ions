#ifndef NUM_TRAIL_POINTS
#define NUM_TRAIL_POINTS 16
#endif

precision highp float;
uniform sampler2D texX[15];
uniform sampler2D texP;

uniform float texDim;
varying vec3 vColor;

attribute float bodyIndex;
attribute float trailIndex;

const vec3 negativeColor = vec3(1.0, 0.0, 1.0);
const vec3 neutralColor = vec3(1.0, 1.0, 1.0);
const vec3 positiveColor = vec3(0.0, 1.0, 1.0);

void main() {
  vec2 bodyLookup = vec2(mod(bodyIndex, texDim) / texDim, floor(bodyIndex / texDim) / texDim);
  float q = texture2D(texP, bodyLookup).y;
  // vColor = P * 10.0;
  // vColor = vec3(bodyLookup * 10.0, q);
  // vColor = vec3(1.0, 1.0, 1.0);
  vec3 color = mix(negativeColor, neutralColor, smoothstep(-1.0, 0.0, q));
  vColor = mix(color, positiveColor, smoothstep(0.0, 1.0, q)) * (1.0 - (trailIndex / 16.0));
  vec3 X = vec3(0.0, 0.0, 0.0);

  int intIndex = int(trailIndex);
  #pragma unroll_loop_start
  for ( int i = 0; i < 15; i ++ ) {
    if (UNROLLED_LOOP_INDEX == intIndex) {
      X = texture2D(texX[UNROLLED_LOOP_INDEX], bodyLookup).xyz;
    }
  }
  #pragma unroll_loop_end
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz + X, 1.0);
}
