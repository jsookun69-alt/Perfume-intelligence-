"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, PresentationControls, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { Bottle } from "@/lib/types";

const CAP_MATERIAL: Record<string, { color: string; metalness: number; roughness: number; transmission?: number }> = {
  gold: { color: "#d8b46a", metalness: 1, roughness: 0.22 },
  silver: { color: "#dfe3e8", metalness: 1, roughness: 0.18 },
  black: { color: "#141414", metalness: 0.6, roughness: 0.32 },
  white: { color: "#f1ede6", metalness: 0.1, roughness: 0.35 },
  wood: { color: "#6b4527", metalness: 0, roughness: 0.75 },
  crystal: { color: "#ffffff", metalness: 0, roughness: 0.02, transmission: 1 },
};

function lum(c: string) {
  const col = new THREE.Color(c);
  return 0.299 * col.r + 0.587 * col.g + 0.114 * col.b;
}

function Body({ shape, material, scale = 1 }: { shape: string; material: THREE.Material; scale?: number }) {
  const mat = <primitive object={material} attach="material" />;
  switch (shape) {
    case "square":
      return <RoundedBox args={[1.45 * scale, 1.2 * scale, 0.72 * scale]} radius={0.06 * scale} smoothness={6} castShadow>{mat}</RoundedBox>;
    case "rounded_rect":
      return <RoundedBox args={[1.15 * scale, 1.55 * scale, 0.62 * scale]} radius={0.24 * scale} smoothness={8} castShadow>{mat}</RoundedBox>;
    case "round":
      return (
        <mesh scale={[1, 1.06, 0.58]} castShadow>
          <sphereGeometry args={[0.82 * scale, 64, 64]} />
          {mat}
        </mesh>
      );
    case "faceted":
      return (
        <mesh castShadow>
          <cylinderGeometry args={[0.66 * scale, 0.74 * scale, 1.5 * scale, 8, 1]} />
          {mat}
        </mesh>
      );
    case "tapered":
      return (
        <mesh rotation={[0, Math.PI / 4, 0]} castShadow>
          <cylinderGeometry args={[0.5 * scale, 0.95 * scale, 1.6 * scale, 4, 1]} />
          {mat}
        </mesh>
      );
    default:
      return <RoundedBox args={[1.1 * scale, 1.62 * scale, 0.56 * scale]} radius={0.08 * scale} smoothness={6} castShadow>{mat}</RoundedBox>;
  }
}

function bodyHeight(shape: string) {
  return shape === "square" ? 1.2 : shape === "round" ? 1.74 : shape === "faceted" ? 1.5 : 1.6;
}

function PerfumeBottle({ bottle, interactive }: { bottle: Bottle; interactive: boolean }) {
  const group = useRef<THREE.Group>(null);
  const h = bodyHeight(bottle.shape);
  const glassTint = bottle.opaque ? bottle.glass : lum(bottle.glass) > 0.8 ? "#ffffff" : bottle.glass;

  const glassMat = useMemo(() => {
    if (bottle.opaque) {
      return new THREE.MeshPhysicalMaterial({ color: bottle.glass, metalness: 0.35, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 });
    }
    return new THREE.MeshPhysicalMaterial({
      color: glassTint, transmission: 1, roughness: 0.04, thickness: 0.9, ior: 1.5,
      attenuationColor: new THREE.Color(bottle.liquid), attenuationDistance: 1.2,
      clearcoat: 1, clearcoatRoughness: 0.05, specularIntensity: 1,
    });
  }, [bottle.opaque, bottle.glass, bottle.liquid, glassTint]);

  const liquidMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: bottle.liquid, roughness: 0.15, transmission: 0.55, thickness: 0.5, ior: 1.33, transparent: true, opacity: 0.92 }),
    [bottle.liquid],
  );

  const capCfg = CAP_MATERIAL[bottle.capStyle] ?? { color: bottle.cap, metalness: 0.55, roughness: 0.25 };

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    if (!interactive) g.rotation.y += dt * 0.25;
    // cursor-responsive tilt
    const tx = state.pointer.y * 0.18, ty = state.pointer.x * 0.35;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, tx, 0.05);
    if (interactive) g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, ty, 0.05);
  });

  return (
    <group ref={group} position={[0, -0.25, 0]}>
      <Body shape={bottle.shape} material={glassMat} />
      {!bottle.opaque && (
        <group position={[0, -h * 0.14, 0]} scale={[0.86, 0.66, 0.84]}>
          <Body shape={bottle.shape} material={liquidMat} />
        </group>
      )}
      {bottle.accent && (
        <mesh position={[0, 0, (bottle.shape === "square" ? 0.37 : bottle.shape === "round" ? 0.48 : 0.3)]}>
          <boxGeometry args={[0.55, 0.22, 0.01]} />
          <meshStandardMaterial color={bottle.accent} metalness={0.6} roughness={0.3} />
        </mesh>
      )}
      {/* neck */}
      <mesh position={[0, h / 2 + 0.08, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.16, 32]} />
        <meshStandardMaterial color="#1c1612" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* cap */}
      <mesh position={[0, h / 2 + 0.42, 0]} castShadow>
        {bottle.shape === "round" || bottle.shape === "rounded_rect" ? (
          <cylinderGeometry args={[0.26, 0.26, 0.56, 48]} />
        ) : (
          <boxGeometry args={[0.5, 0.56, 0.5]} />
        )}
        <meshPhysicalMaterial
          color={capCfg.color}
          metalness={capCfg.metalness}
          roughness={capCfg.roughness}
          transmission={capCfg.transmission ?? 0}
          clearcoat={0.6}
        />
      </mesh>
    </group>
  );
}

export interface BottleSceneProps {
  bottle: Bottle;
  /** Product pages allow drag-to-rotate; the hero follows the cursor. */
  interactive?: boolean;
  sparkles?: boolean;
  active?: boolean;
  background?: "cave" | "transparent";
}

export default function BottleScene({ bottle, interactive = false, sparkles = true, active = true }: BottleSceneProps) {
  const content = <PerfumeBottle bottle={bottle} interactive={interactive} />;
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.2, 4.6], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <ambientLight intensity={0.35} />
      <spotLight position={[3, 5, 4]} angle={0.4} penumbra={1} intensity={60} color="#fff3dd" castShadow />
      <pointLight position={[-3, 1, -2]} intensity={12} color="#d4b483" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, -3]} scale={[8, 2, 1]} color="#fff6e6" />
        <Lightformer form="rect" intensity={2} position={[-4, 1, 1]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} color="#ecd9b4" />
        <Lightformer form="rect" intensity={1.4} position={[4, 0, 1]} rotation-y={-Math.PI / 2} scale={[4, 6, 1]} color="#9fd1bd" />
        <Lightformer form="ring" intensity={2} position={[0, 0, 5]} scale={3} color="#ffffff" />
      </Environment>
      <Float speed={1.4} rotationIntensity={interactive ? 0.15 : 0.3} floatIntensity={0.6}>
        {interactive ? (
          <PresentationControls global={false} cursor snap polar={[-0.3, 0.3]} azimuth={[-Math.PI, Math.PI]}>
            {content}
          </PresentationControls>
        ) : (
          content
        )}
      </Float>
      {sparkles && <Sparkles count={60} scale={[5, 4, 3]} size={2.2} speed={0.25} opacity={0.7} color="#e2c696" />}
      <ContactShadows position={[0, -1.35, 0]} opacity={0.45} scale={6} blur={2.6} far={2.5} color="#000" />
    </Canvas>
  );
}
