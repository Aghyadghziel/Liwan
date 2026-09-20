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
    float amp = 0.028 / (1.0 + fi * 0.85);
    float phase = dot(p, dir) * freq + t * speed;
    h += sin(phase) * amp;
    slope += dir * cos(phase) * freq * amp;
  }
  return normalize(vec3(-slope.x, 1.0, -slope.y));
}

void main() {
  vec3 view = normalize(cameraPosition - vWorld);
  vec3 normal = rippleNormal(vWorld.xz, uTime);

  // Deeper toward the middle of the basin, paler over the steps at the near end.
  float shallow = smoothstep(0.42, 0.04, vUv.y);
  vec3 body = mix(uDeep, uShallow, shallow * 0.85);

  // Water is a mirror at grazing angles and a window straight down.
  float fresnel = 0.05 + 0.95 * pow(1.0 - clamp(dot(view, normal), 0.0, 1.0), 4.2);
  vec3 reflected = mix(uHorizon, uSky, clamp(view.y * 1.4, 0.0, 1.0));
  vec3 colour = mix(body, reflected, clamp(fresnel * 0.92, 0.0, 0.9));

  // The sun's own highlight, tight enough to read as a glint on moving water.
  vec3 halfway = normalize(view + normalize(uSun));
  float glint = pow(max(dot(normal, halfway), 0.0), 260.0);
  colour += vec3(1.0, 0.95, 0.86) * glint * 1.6;

  // A little sparkle where the ripples turn toward the light.
  float sparkle = pow(max(normal.y - 0.985, 0.0) * 60.0, 2.0);
  colour += vec3(0.9, 0.97, 1.0) * sparkle * 0.16;

  gl_FragColor = vec4(colour * 1.08, 0.93);
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
      uSky: { value: new THREE.Color('#9db9d8') },
      uHorizon: { value: new THREE.Color('#dcd2c2') },
      uSun: { value: new THREE.Vector3(-0.45, 0.32, -0.82).normalize() },
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
      <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} toneMapped />
    </mesh>
  );
}
