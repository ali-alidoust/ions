precision highp float;
varying vec2 vUv;
uniform sampler2D texX;
uniform sampler2D texV;
uniform sampler2D texP;
uniform float texDim;
uniform float dt;
// uniform float minX;
// uniform float minY;
// uniform float minZ;
// uniform float maxX;
// uniform float maxY;
// uniform float maxZ;
const float cutoffDistance = 0.01;

void main() {
  vec3 currX = texture2D(texX, vUv.xy).xyz;
  vec3 currV = texture2D(texV, vUv.xy).xyz;
  vec3 currP = texture2D(texP, vUv.xy).xyz;

  vec3 F = vec3(0.0, 0.0, 0.0);

  for (float i = 0.0; i < texDim; i++) {
    for (float j = 0.0; j < texDim; j++) {
      vec3 otherX = texture2D(texX, vec2(i / texDim, j / texDim)).xyz;
      vec3 otherV = texture2D(texV, vec2(i / texDim, j / texDim)).xyz;
      vec3 otherP = texture2D(texP, vec2(i / texDim, j / texDim)).xyz;
      vec3 R = otherX - currX;
      float R2 = dot(R, R);
      vec3 normR = normalize(R);
      float lenR = length(R);
      if (lenR >= cutoffDistance) {
        // Gravitation
        F += currP.x * otherP.x * normR / R2;

        // Electric force
        F += -1.0 * currP.y * otherP.y * normR / R2;

        // Magnetic force
        F += -(0.01 * currP.y * otherP.y / R2) * (cross(currV, (cross(otherV, normR))));
      } else if (lenR != 0.0) {
        float cutoffDistance2 = cutoffDistance * cutoffDistance;
        float ratio = lenR / cutoffDistance;
        F += mix(vec3(0.0, 0.0, 0.0), currP.x * otherP.x * normR / cutoffDistance2, ratio);
        F += mix(vec3(0.0, 0.0, 0.0), -1.0 * currP.y * otherP.y * normR / cutoffDistance2, ratio);
        F += mix(vec3(0.0, 0.0, 0.0), -(0.01 * currP.y * otherP.y / cutoffDistance2) * (cross(currV, (cross(otherV, normR)))), ratio);
      }
    }
  }

  vec3 newV = currV + (F / currP.x * 0.00000001);
  vec3 newPos = currX + newV * dt;

  if (newPos.x <= -0.5 || newPos.x >= 0.5) {
    newV.x = -newV.x * 0.1;
  }
  if (newPos.y <= -0.5 || newPos.y >= 0.5) {
    newV.y = -newV.y * 0.1;
  }
  if (newPos.z <= -0.5 || newPos.z >= 0.5) {
    newV.z = -newV.z * 0.1;
  }

  gl_FragColor = vec4(newV, 1.0);
}
