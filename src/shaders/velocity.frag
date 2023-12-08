precision highp float;

uniform sampler2D texS;
uniform sampler2D texV;
uniform sampler2D texP;
uniform float texDim;
uniform float dt;
uniform float gravitationalConstant;
uniform float electricConstant;
uniform float magneticConstant;
const float cutoffDistance = 0.01f;

in vec2 vUv;
out vec4 fragColor;

void main() {
  vec3 currX = texture(texS, vUv).xyz;
  vec3 currV = texture(texV, vUv).xyz;
  vec3 currP = texture(texP, vUv).xyz;

  vec3 F = vec3(0.0f, 0.0f, 0.0f);

  for(float i = 0.0f; i < texDim; i++) {
    float other_i = i / texDim;
    for(float j = 0.0f; j < texDim; j++) {
      float other_j = j / texDim;
      vec3 otherS = texture(texS, vec2(other_i, other_j)).xyz;
      vec3 otherV = texture(texV, vec2(other_i, other_j)).xyz;
      vec3 otherP = texture(texP, vec2(other_i, other_j)).xyz;
      vec3 R = otherS - currX;
      vec3 normR = normalize(R);
      float lenR = length(R);

      if(lenR == 0.0f) {
        continue;
      }

      float R2 = lenR < cutoffDistance ? cutoffDistance * cutoffDistance : dot(R, R);
      vec3 pairwiseF = vec3(0.0f, 0.0f, 0.0f);

      // Gravitation
      pairwiseF += gravitationalConstant * currP.x * otherP.x * normR / R2;

      // Electric force
      pairwiseF += -electricConstant * currP.y * otherP.y * normR / R2;

      // Magnetic force
      // pairwiseF += magneticConstant * (currP.y * otherP.y / R2) * (cross(currV, (cross(otherV, normR))));

      if(lenR < cutoffDistance) {
        float ratio = lenR / cutoffDistance;
        pairwiseF = mix(vec3(0.0f, 0.0f, 0.0f), pairwiseF, ratio);
      }

      F += pairwiseF;
    }
  }

  vec3 newV = currV + (F / currP.x * dt);
  vec3 newPos = currX + newV * dt;

  if(newPos.x <= -0.5f || newPos.x >= 0.5f) {
    newV.x = -newV.x * 0.1f;
  }
  if(newPos.y <= -0.5f || newPos.y >= 0.5f) {
    newV.y = -newV.y * 0.1f;
  }
  if(newPos.z <= -0.5f || newPos.z >= 0.5f) {
    newV.z = -newV.z * 0.1f;
  }

  fragColor = vec4(newV, 1.0f);
}
