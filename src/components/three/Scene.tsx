'use client';

/* eslint-disable react-hooks/immutability -- three.js is a mutable scene graph: a render loop
   moves the camera and the controls by assigning to them every frame. There is no immutable
   equivalent, and copying these objects per frame would defeat the point of the loop. */

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls, PerformanceMonitor } from '@react-three/drei';
import { BrightnessContrast, DepthOfField, EffectComposer, HueSaturation, SMAA, SSAO, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { RectAreaLightUniformsLib } from 'three-stdlib';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Materials } from './Materials';
import { Villa } from './Villa';
import { getCameraMode, heroCurves, sampleFov, SHOTS, subscribeCamera } from '@/lib/villa/camera';
import { PLAN } from '@/lib/villa/geometry';

/* ── Sky ──────────────────────────────────────────────────
   A gradient dome rather than a flat colour: the horizon warms toward the sun, so the
   glass and the water have something to reflect. */

const skyVertex = /* glsl */ `
varying vec3 vWorld;
void main() {
  vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const skyFragment = /* glsl */ `
uniform vec3 uHigh;
uniform vec3 uLow;
uniform vec3 uSun;
varying vec3 vWorld;
void main() {
  vec3 dir = normalize(vWorld);
  float height = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 sky = mix(uLow, uHigh, pow(height, 0.85));
  // A wide, soft glow where the sun sits, never a disc.
  float glow = pow(max(dot(dir, normalize(uSun)), 0.0), 6.0);
  sky += uSun * 0.0 + vec3(1.0, 0.86, 0.68) * glow * 0.32;
  gl_FragColor = vec4(sky, 1.0);
}`;

function Sky() {
  const uniforms = useMemo(
    () => ({
      uHigh: { value: new THREE.Color('#7c9cc4') },
      uLow: { value: new THREE.Color('#e7d9c6') },
      uSun: { value: new THREE.Vector3(-0.45, 0.32, -0.82).normalize() },
    }),
    [],
  );
  return (
    <mesh scale={260} renderOrder={-1}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial vertexShader={skyVertex} fragmentShader={skyFragment} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/* ── Light ────────────────────────────────────────────────
   One low sun for long shadows, a soft fill from the sky, and an environment built from
   light panels in the scene — so reflections are ours, with nothing downloaded. */

function Light({ quality }: { quality: 'high' | 'low' }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const size = quality === 'high' ? 2048 : 1024;

  useEffect(() => {
    const light = sun.current;
    if (!light) return;
    const camera = light.shadow.camera;
    camera.left = -46;
    camera.right = 46;
    camera.top = 46;
    camera.bottom = -46;
    camera.near = 1;
    camera.far = 140;
    camera.updateProjectionMatrix();
    light.shadow.bias = -0.0006;
    light.shadow.normalBias = 0.035;
  }, []);

  return (
    <>
      <directionalLight
        ref={sun}
        position={[-38, 30, -52]}
        intensity={3.4}
        color="#fff1dc"
        castShadow
        shadow-mapSize-width={size}
        shadow-mapSize-height={size}
      />
      <hemisphereLight args={['#bcd2ef', '#c8b79c', 0.38]} />
      <Environment resolution={quality === 'high' ? 256 : 128} frames={1}>
        {/* The same sky, rendered into the reflection map. Without it every polished surface
            mirrors black, and the pool reads as a hole rather than water. */}
        <Sky />
        {/* The sky as a large soft source above the house. */}
        <Lightformer form="rect" intensity={1.8} color="#eaf2ff" position={[0, 26, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[70, 70, 1]} />
        {/* The sun's own panel, warm and low. */}
        <Lightformer form="rect" intensity={5} color="#ffd7a8" position={[-34, 14, -40]} rotation={[0, Math.PI / 3.2, 0]} scale={[26, 16, 1]} />
        {/* Bounce off the terrace, which is what lifts the interior ceilings. */}
        <Lightformer form="rect" intensity={1.1} color="#e3cfae" position={[0, -6, 16]} rotation={[-Math.PI / 2, 0, 0]} scale={[60, 40, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#9fb6d6" position={[30, 8, 24]} rotation={[0, -Math.PI / 2.4, 0]} scale={[30, 20, 1]} />
      </Environment>
    </>
  );
}

/* ── Camera ───────────────────────────────────────────────
   One rig serves both the scrolled film and the configurator, easing toward whatever the
   current mode asks for. Nothing snaps. */

function CameraRig({ controls }: { controls: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera } = useThree();
  const curves = useMemo(() => heroCurves(), []);
  const wanted = useRef({ position: new THREE.Vector3(...SHOTS.wide.position), target: new THREE.Vector3(...SHOTS.wide.target), fov: SHOTS.wide.fov ?? 40 });
  const current = useRef({ target: new THREE.Vector3(...SHOTS.wide.target) });
  const orbiting = useRef(false);

  useEffect(() => {
    const read = () => {
      const mode = getCameraMode();
      if (mode.kind === 'path') {
        const t = THREE.MathUtils.clamp(mode.progress, 0, 1);
        curves.position.getPointAt(t, wanted.current.position);
        curves.target.getPointAt(t, wanted.current.target);
        wanted.current.fov = sampleFov(curves.fov, t);
        orbiting.current = false;
      } else {
        const shot = SHOTS[mode.name];
        wanted.current.position.set(...shot.position);
        wanted.current.target.set(...shot.target);
        wanted.current.fov = shot.fov ?? 42;
        orbiting.current = mode.orbit;
      }
    };
    read();
    return subscribeCamera(read);
  }, [curves]);

  useFrame((_, delta) => {
    const perspective = camera as THREE.PerspectiveCamera;
    const control = controls.current;
    const handOver = orbiting.current && control && perspective.position.distanceTo(wanted.current.position) < 0.35;

    // Ease in position and aim. The exponent keeps the move frame-rate independent.
    const ease = 1 - Math.pow(0.0016, Math.min(delta, 0.05));
    if (!handOver) {
      perspective.position.lerp(wanted.current.position, ease);
      current.current.target.lerp(wanted.current.target, ease);
      perspective.lookAt(current.current.target);
      if (control) control.target.copy(current.current.target);
    }

    // A portrait screen sees far less of a scene at the same focal length, so the lens opens
    // up as the frame narrows. Without this every shot is a crop on a phone.
    const widen = perspective.aspect < 1 ? THREE.MathUtils.clamp(1.5 - perspective.aspect * 0.42, 1, 1.42) : 1;
    const fov = THREE.MathUtils.lerp(perspective.fov, wanted.current.fov * widen, ease);
    if (Math.abs(fov - perspective.fov) > 0.001) {
      perspective.fov = fov;
      perspective.updateProjectionMatrix();
    }

    if (control) {
      control.enabled = Boolean(handOver);
      if (handOver) control.update();
    }
  });

  return null;
}

/* ── Effects ──────────────────────────────────────────────
   Occlusion is what stops a render looking like plastic: it darkens the creases where
   surfaces meet. Depth of field and a light grade do the rest of the photography. */

function Effects({ quality }: { quality: 'high' | 'low' }) {
  const { camera } = useThree();
  const focus = useRef(0.02);
  const dof = useRef<{ target?: THREE.Vector3; circleOfConfusionMaterial?: { uniforms: { focusDistance: { value: number } } } } | null>(null);

  // Keep the focal plane on whatever the camera is aimed at, as a focus puller would.
  useFrame(() => {
    const distance = camera.position.length();
    const wanted = THREE.MathUtils.clamp(distance / 260, 0.004, 0.2);
    focus.current = THREE.MathUtils.lerp(focus.current, wanted, 0.05);
    const material = dof.current?.circleOfConfusionMaterial;
    if (material) material.uniforms.focusDistance.value = focus.current;
  });

  if (quality === 'low') {
    return (
      <EffectComposer multisampling={4}>
        <Vignette offset={0.3} darkness={0.42} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer enableNormalPass multisampling={0}>
      <SSAO
        blendFunction={BlendFunction.MULTIPLY}
        samples={24}
        rings={5}
        distanceThreshold={0.9}
        distanceFalloff={0.12}
        rangeThreshold={0.0015}
        rangeFalloff={0.01}
        luminanceInfluence={0.55}
        radius={0.06}
        intensity={5}
        bias={0.03}
        worldDistanceThreshold={40}
        worldDistanceFalloff={12}
        worldProximityThreshold={0.6}
        worldProximityFalloff={0.2}
        color={new THREE.Color('#2a2015')}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <DepthOfField ref={dof as any} focusDistance={0.02} focalLength={0.045} bokehScale={1.3} height={480} />
      <HueSaturation saturation={0.06} />
      <BrightnessContrast contrast={0.07} brightness={-0.01} />
      <Vignette offset={0.28} darkness={0.5} blendFunction={BlendFunction.NORMAL} />
      <SMAA />
    </EffectComposer>
  );
}

/* ── Scene ────────────────────────────────────────────────── */

export type SceneProps = {
  /** 'low' halves the shadow map, drops glass refraction and thins the planting. */
  quality?: 'high' | 'low';
  className?: string;
  onReady?: () => void;
};

function Ready({ onReady }: { onReady?: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onReady?.();
  });
  return null;
}

export function Scene({ quality = 'high', className, onReady }: SceneProps) {
  const controls = useRef<OrbitControlsImpl>(null);
  const [dpr, setDpr] = useState(quality === 'high' ? 1.5 : 1);

  return (
    <Canvas
      className={className}
      shadows
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: SHOTS.wide.position, fov: SHOTS.wide.fov, near: 0.1, far: 500 }}
      onCreated={({ gl, scene }) => {
        // Without this the soft window light renders black.
        RectAreaLightUniformsLib.init();
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.02;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        scene.fog = new THREE.Fog('#d9cdbb', 90, 240);
      }}
    >
      {/* Drop resolution rather than frames when the device struggles. */}
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(quality === 'high' ? 1.5 : 1)} />
      <Sky />
      <Light quality={quality} />
      <Materials quality={quality}>
        <Villa detail={quality} />
      </Materials>
      <CameraRig controls={controls} />
      <Effects quality={quality} />
      <OrbitControls
        ref={controls}
        enabled={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={3}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.04}
        minPolarAngle={0.12}
        target={[0, 3, 2]}
      />
      <Ready onReady={onReady} />
      {/* Keeps the camera above ground however far the visitor orbits. */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[PLAN.site, PLAN.site]} />
      </mesh>
    </Canvas>
  );
}
