// ============================================
// 3D Character Models — GLB with auto-centering
// ============================================

import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Center, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import type { CharacterDef } from '@/lib/gameRegistry';

interface CharacterModelProps {
  character: CharacterDef;
  rotate?: boolean;
  scale?: number;
  skinLevel?: number;
}

const CHARACTER_GLB_MAP: Record<string, string> = {
  ghost_riley: '/Models/Characters/snake_eyes__fortnite_item_shop_skin.glb',
  nova_prime: '/Models/Characters/fortnite_oblivion_skin.glb',
  viper_snake: '/Models/Characters/torin__fortnite_chapter_2_season_8_bp_skin.glb',
  shadow_exe: '/Models/Characters/the_omega_tier_100_skin_fortnite_3d_model.glb',
  midas_gold: '/Models/Characters/midas__fortnite_100_tier_s12_bp_skin.glb',
  marigold: '/Models/Characters/marigold_fortnite_skin__female_midas.glb',
  glow_phantom: '/Models/Characters/glow__fortnite_outfit.glb',
};

const GLBCharacter: React.FC<{ characterId: string }> = ({ characterId }) => {
  const path = CHARACTER_GLB_MAP[characterId];
  const { scene } = useGLTF(path);

  const cloned = React.useMemo(() => {
    const c = scene.clone();
    c.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const oldMat = child.material;
        child.material = new THREE.MeshStandardMaterial({
          color: oldMat.color || new THREE.Color(0x888888),
          map: oldMat.map || null,
          normalMap: oldMat.normalMap || null,
          roughness: oldMat.roughness ?? 0.5,
          metalness: oldMat.metalness ?? 0.3,
          side: THREE.DoubleSide,
        });
      }
    });
    return c;
  }, [scene]);

  return (
    <Center>
      <primitive object={cloned} />
    </Center>
  );
};

const FallbackModel: React.FC<{ colors: CharacterDef['colors'] }> = ({ colors }) => (
  <group>
    <mesh position={[0, 0.5, 0]}>
      <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
      <meshStandardMaterial color={colors.primary} roughness={0.5} metalness={0.3} />
    </mesh>
    <mesh position={[0, 1.1, 0]}>
      <sphereGeometry args={[0.2, 12, 12]} />
      <meshStandardMaterial color={colors.secondary} roughness={0.4} metalness={0.5} />
    </mesh>
  </group>
);

class GLBErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

const CharacterModel3D: React.FC<CharacterModelProps> = ({ character, rotate = true, scale = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (rotate && groupRef.current) groupRef.current.rotation.y += delta * 0.4;
  });

  const hasGLB = character.id in CHARACTER_GLB_MAP;
  const fallback = <FallbackModel colors={character.colors} />;

  return (
    <group ref={groupRef} scale={scale}>
      {hasGLB ? (
        <GLBErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <GLBCharacter characterId={character.id} />
          </Suspense>
        </GLBErrorBoundary>
      ) : fallback}
    </group>
  );
};

export default CharacterModel3D;

Object.values(CHARACTER_GLB_MAP).forEach(path => {
  try { useGLTF.preload(path); } catch {}
});
