'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSpec } from '@/lib/villa/config';
import { poolParts } from '@/lib/villa/geometry';

/**
 * The pool surface. A physical material would mirror whatever the environment map holds,
 * which in a scene lit by light panels is mostly nothing. Water is instead drawn directly:
 * the colour of the plaster bed seen through depth, the sky picked up at grazing angles, a
 * moving ripple normal, and one sharp glint where the sun lands.
 */

const vertex = /* glsl */ `
varying vec3 vWorld;
varying vec2 vUv;
void main() {
  vUv = uv;
  vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragment = /* glsl */ `
uniform float uTime;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uSky;
uniform vec3 uHorizon;
uniform vec3 uSun;
varying vec3 vWorld;
varying vec2 vUv;

/** Crossed wave trains: cheap, and closer to a pool than noise, which reads as cloth. */
vec3 rippleNormal(vec2 p, float t) {
  float h = 0.0;
  vec2 slope = vec2(0.0);
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 dir = normalize(vec2(cos(fi * 2.1 + 0.6), sin(fi * 1.7 + 1.2)));
    float freq = 2.4 + fi * 2.7;
    float speed = 0.5 + fi * 0.22;
    float amp = 0.016 / (1.0 + fi * 0.85);
    float phase = dot(p, dir) * freq + t * speed;
    h += sin(phase) * amp;
    slope += dir * cos(phase) * freq * amp;
  }
  return normalize(vec3(-slope.x, 1.0, -slope.y));
}

void main() {
  vec3 view = normalize(cameraPosition - vWorld);
  vec3 normal = rippleNormal(vWorld.xz, uTime);

  // The bed, seen through moving water: the ripple bends the line of sight, so the mosaic
  // joints swim. This wobble is most of what makes a pool read as water and not as paint.
  vec2 bed = vWorld.xz + normal.xz * 1.6 + view.xz / max(view.y, 0.25) * 0.5;
  vec2 cell = abs(fract(bed / 0.3) - 0.5);
  float joint = smoothstep(0.455, 0.49, max(cell.x, cell.y));

  // Deeper toward the middle of the basin, paler over the steps at the near end.
  float shallow = smoothstep(0.42, 0.04, vUv.y);
  vec3 body = mix(uDeep, uShallow, shallow * 0.85);
  body = mix(body, body * 1.22 + 0.03, joint * 0.5);

  // Caustics: where two wave trains focus the sun onto the bed.
  float c1 = sin(bed.x * 3.4 + uTime * 0.7) * sin(bed.y * 2.9 - uTime * 0.5);
  float c2 = sin((bed.x + bed.y) * 2.3 - uTime * 0.6) * sin((bed.x - bed.y) * 3.1 + uTime * 0.4);
  float caustic = pow(clamp(1.0 - abs(c1 + c2) * 0.9, 0.0, 1.0), 5.0);
  body += vec3(0.75, 0.95, 1.0) * caustic * 0.11;

  // Water is a mirror at grazing angles and a window straight down.
  float fresnel = 0.04 + 0.96 * pow(1.0 - clamp(dot(view, normal), 0.0, 1.0), 4.6);
  vec3 reflected = mix(uHorizon, uSky, clamp(view.y * 1.4, 0.0, 1.0));
  vec3 colour = mix(body, reflected, clamp(fresnel, 0.0, 0.92));

  // The sun's own highlight, tight enough to read as a glint on moving water.
  vec3 halfway = normalize(view + normalize(uSun));
  float glint = pow(max(dot(normal, halfway), 0.0), 320.0);
  colour += vec3(1.0, 0.95, 0.86) * glint * 1.4;

  gl_FragColor = vec4(colour, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function Water() {
  const spec = useSpec();
  const parts = poolParts();
  const [cx, , cz] = parts.centre;
  const material = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color('#1d7f9b') },
      uShallow: { value: new THREE.Color('#66c6d6') },
      uSky: { value: new THREE.Color('#7fa6d6') },
      uHorizon: { value: new THREE.Color('#d9dee2') },
      uSun: { value: new THREE.Vector3(-44, 27, 30).normalize() },
    }),
    [],
  );

  // A pool takes its colour from the plaster it is lined with; the choice retints both.
  const deep = spec.water === 'deep' ? '#1d7f9b' : '#58bccb';
  const shallow = spec.water === 'deep' ? '#66c6d6' : '#a6e2ea';

  useFrame((state, delta) => {
    const current = material.current;
    if (!current) return;
    current.uniforms.uTime.value = state.clock.elapsedTime;
    const ease = 1 - Math.pow(0.001, Math.min(delta, 0.05));
    (current.uniforms.uDeep.value as THREE.Color).lerp(new THREE.Color(deep), ease);
    (current.uniforms.uShallow.value as THREE.Color).lerp(new THREE.Color(shallow), ease);
  });

  return (
    <mesh geometry={parts.water} position={[cx, -0.12, cz]} rotation={[-Math.PI / 2, 0, 0]}>
      <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
    </mesh>
  );
}
