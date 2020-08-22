#ifndef NUM_TRAIL_POINTS
#define NUM_TRAIL_POINTS 16
#endif

precision highp float;
uniform sampler2D texX[NUM_TRAIL_POINTS];
uniform sampler2D texV;
uniform sampler2D texP;

uniform float texDim;
varying vec3 vColor;

attribute float bodyIndex;
attribute float trailIndex;

const vec3 negativeColor = vec3(1.0, 0.0, 1.0);
const vec3 neutralColor = vec3(1.0, 1.0, 1.0);
const vec3 positiveColor = vec3(0.0, 1.0, 1.0);

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {

  vec2 bodyLookup = vec2(mod(bodyIndex, texDim) / texDim, floor(bodyIndex / texDim) / texDim);
  vec3 P = texture2D(texP, bodyLookup).xyz;
  vec3 color = mix(negativeColor, neutralColor, smoothstep(-1.0, 0.0, P.y));
  vColor = mix(color, positiveColor, smoothstep(0.0, 1.0, P.y)) * (1.0 - (trailIndex / 16.0));
  // vColor = vec3(1.0, 1.0, 1.0);
  vec3 X = vec3(0.0, 0.0, 0.0);
  // X = texture2D(texX[1], bodyLookup).xyz;
  #pragma unroll_loop_start
  for ( int i = 0; i < 16; i ++ ) {
    if (UNROLLED_LOOP_INDEX == int(trailIndex)) {
      X = texture2D(texX[UNROLLED_LOOP_INDEX], bodyLookup).xyz;
    }
  }
  #pragma unroll_loop_end
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz + X, 1.0);
}
