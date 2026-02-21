// ============================================
// 3D Weapon Models — GLB with auto-centering
// ============================================

import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

interface WeaponModelProps {
  weaponId: string;
  rotate?: boolean;
  scale?: number;
}

const WEAPON_GLB_MAP: Record<string, string> = {
  k416: '/Models/weapons/rifle__m4a1-s_weapon_model_cs2.glb',
  ak_death: '/Models/weapons/ak-47disassembly_of_weapons.glb',
  awm_x: '/Models/weapons/rifle__awp_weapon_model_cs2.glb',
  vector_neon: '/Models/weapons/animated_pp-19-01.glb',
  s12_breacher: '/Models/weapons/shotgun_mr-133_animated.glb',
  desert_eagle: '/Models/weapons/pistol__desert_eagle_weapon_model_cs2.glb',
  glock_17: '/Models/weapons/glock_17_-_fps_weapon_animations_pack_v.1.glb',
  m4a4_thunder: '/Models/weapons/rifle__m4a4_weapon_model_cs2.glb',
  sniper_elite: '/Models/weapons/sniper.glb',
  usp_shadow: '/Models/weapons/pistol__usp-s_weapon_model_cs2.glb',
  awp_black: '/Models/weapons/rifle__awp_black_version_weapon_model_cs2.glb',
  cz100: '/Models/weapons/cz100__realtime_weapon.glb',
  cheytac: '/Models/weapons/cheytac_m300_mcmillan_stock.glb',
  t77: '/Models/weapons/t77_handgun.glb',
  colt_m1911: '/Models/weapons/colt_pistol_m1911a1_game_asset.glb',
};

const GLBWeapon: React.FC<{ weaponId: string }> = ({ weaponId }) => {
  const path = WEAPON_GLB_MAP[weaponId];
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

const FallbackWeapon: React.FC<{ scale: number }> = ({ scale }) => (
  <group scale={scale}>
    <mesh>
      <boxGeometry args={[1.2, 0.2, 0.15]} />
      <meshStandardMaterial color="#333" roughness={0.3} metalness={0.8} />
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

const WeaponModel3D: React.FC<WeaponModelProps> = ({ weaponId, rotate = true, scale = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (rotate && groupRef.current) groupRef.current.rotation.y += delta * 0.5;
  });

  const hasGLB = weaponId in WEAPON_GLB_MAP;
  const fallback = <FallbackWeapon scale={scale} />;

  return (
    <group ref={groupRef} scale={scale}>
      {hasGLB ? (
        <GLBErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <GLBWeapon weaponId={weaponId} />
          </Suspense>
        </GLBErrorBoundary>
      ) : fallback}
    </group>
  );
};

export default WeaponModel3D;

Object.values(WEAPON_GLB_MAP).forEach(path => {
  try { useGLTF.preload(path); } catch {}
});
