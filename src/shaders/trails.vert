#ifndef NUM_TRAIL_POINTS
#define NUM_TRAIL_POINTS 16
#endif

precision highp float;
uniform sampler2D texS[15];
uniform sampler2D texP;

uniform float texDim;
out vec3 vColor;

in float bodyIndex;
in float trailIndex;

const vec3 negativeColor = vec3(1.0f, 0.0f, 1.0f);
const vec3 neutralColor = vec3(1.0f, 1.0f, 1.0f);
const vec3 positiveColor = vec3(0.0f, 1.0f, 1.0f);

void main() {
  vec2 bodyLookup = vec2(mod(bodyIndex, texDim) / texDim, floor(bodyIndex / texDim) / texDim);
  float q = texture(texP, bodyLookup).y;
  // vColor = P * 10.0;
  // vColor = vec3(bodyLookup * 10.0, q);
  // vColor = vec3(1.0, 1.0, 1.0);
  vec3 color = mix(negativeColor, neutralColor, smoothstep(-1.0f, 0.0f, q));
  vColor = mix(color, positiveColor, smoothstep(0.0f, 1.0f, q)) * (1.0f - (trailIndex / 16.0f));
  vec3 S = vec3(0.0f, 0.0f, 0.0f);

  int intIndex = int(trailIndex);
  // S = texture(texS[intIndex], bodyLookup).xyz;
  for(int i = 0; i < 15; i++) {
    if(intIndex == 0) {
      S = texture(texS[0], bodyLookup).xyz;
    } else if(intIndex == 1) {
      S = texture(texS[1], bodyLookup).xyz;
    } else if(intIndex == 2) {
      S = texture(texS[2], bodyLookup).xyz;
    } else if(intIndex == 3) {
      S = texture(texS[3], bodyLookup).xyz;
    } else if(intIndex == 4) {
      S = texture(texS[4], bodyLookup).xyz;
    } else if(intIndex == 5) {
      S = texture(texS[5], bodyLookup).xyz;
    } else if(intIndex == 6) {
      S = texture(texS[6], bodyLookup).xyz;
    } else if(intIndex == 7) {
      S = texture(texS[7], bodyLookup).xyz;
    } else if(intIndex == 8) {
      S = texture(texS[8], bodyLookup).xyz;
    } else if(intIndex == 9) {
      S = texture(texS[9], bodyLookup).xyz;
    } else if(intIndex == 10) {
      S = texture(texS[10], bodyLookup).xyz;
    } else if(intIndex == 11) {
      S = texture(texS[11], bodyLookup).xyz;
    } else if(intIndex == 12) {
      S = texture(texS[12], bodyLookup).xyz;
    } else if(intIndex == 13) {
      S = texture(texS[13], bodyLookup).xyz;
    } else if(intIndex == 14) {
      S = texture(texS[14], bodyLookup).xyz;
    }
  }
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz + S, 1.0f);
}
