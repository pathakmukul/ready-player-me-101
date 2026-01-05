import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

// Component to load and animate the avatar
function AnimatedAvatar({
  avatarUrl,
  animationType = 'idle'
}: {
  avatarUrl: string;
  animationType?: string;
}) {
  const group = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);

  // Map animation types to URLs
  const animationMap: { [key: string]: string } = {
    'idle': '/animations/idle.glb',
    'walk': '/animations/walk.glb',
    'run': '/animations/run.glb',
    'jump': '/animations/jump.glb',
    'dance': '/animations/dance.glb',
    'wave': '/animations/wave.glb',
    'sit': '/animations/idle.glb',
    'clap': '/animations/wave.glb',
    'nod': '/animations/wave.glb',
    'shake': '/animations/idle.glb'
  };

  const animationUrl = animationMap[animationType] || '/animations/idle.glb';

  // Load avatar
  const avatarGltf = useLoader(GLTFLoader, avatarUrl);

  // Load animation
  const animationGltf = useLoader(GLTFLoader, animationUrl);

  // Setup and play animations
  useEffect(() => {
    if (!avatarGltf || !animationGltf || !group.current) return;

    console.log('Setting up animation for:', animationType);
    console.log('Avatar URL:', avatarUrl);
    console.log('Animation URL:', animationUrl);

    // Clear the group
    while (group.current.children.length > 0) {
      group.current.remove(group.current.children[0]);
    }

    // Clone the avatar
    const avatarClone = avatarGltf.scene.clone();

    // Ensure all meshes are visible
    avatarClone.traverse((child: any) => {
      if (child.isMesh || child.isSkinnedMesh) {
        child.visible = true;
        child.frustumCulled = false; // Disable frustum culling

        // Ensure materials are visible
        if (child.material) {
          child.material.transparent = false;
          child.material.opacity = 1;
          child.material.side = THREE.DoubleSide;
        }
      }
    });

    // Find the avatar's skeleton
    let avatarSkeleton: THREE.Skeleton | null = null;
    let avatarRoot: THREE.Bone | null = null;

    avatarClone.traverse((child: any) => {
      if (child.isSkinnedMesh && child.skeleton) {
        avatarSkeleton = child.skeleton;
        avatarRoot = child.skeleton.bones[0];
        console.log('Found avatar skeleton with', child.skeleton.bones.length, 'bones');
      }
    });

    if (!avatarSkeleton || !avatarRoot) {
      console.error('No skeleton found in avatar!');
      group.current.add(avatarClone);
      return;
    }

    // Add avatar to scene
    group.current.add(avatarClone);

    // Log avatar's bounding box to check if it's visible
    const box = new THREE.Box3().setFromObject(avatarClone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    console.log('Avatar bounding box - Size:', size, 'Center:', center);

    // Create or update mixer
    if (!mixerRef.current) {
      mixerRef.current = new THREE.AnimationMixer(avatarClone);
    } else {
      // Stop previous animation
      if (currentActionRef.current) {
        currentActionRef.current.stop();
      }
      mixerRef.current.stopAllAction();
      mixerRef.current.uncacheRoot(mixerRef.current.getRoot());
      mixerRef.current = new THREE.AnimationMixer(avatarClone);
    }

    // Get the animation clip
    if (animationGltf.animations && animationGltf.animations.length > 0) {
      const clip = animationGltf.animations[0];
      console.log('Playing animation clip:', clip.name, 'Duration:', clip.duration);

      // Create a bone name mapping
      const boneMap: { [key: string]: THREE.Bone } = {};
      avatarClone.traverse((child: any) => {
        if (child.isBone) {
          boneMap[child.name] = child;
        }
      });

      // Clone and retarget the animation clip
      const retargetedClip = clip.clone();

      // Update tracks to target the correct bones
      retargetedClip.tracks = retargetedClip.tracks.filter(track => {
        // Extract bone name from track name (e.g., "Hips.position" -> "Hips")
        const boneName = track.name.split('.')[0];

        if (boneMap[boneName]) {
          // Update the track to target the avatar's bone
          const property = track.name.split('.')[1];
          track.name = `${boneName}.${property}`;
          return true;
        }
        return false;
      });

      console.log('Retargeted', retargetedClip.tracks.length, 'animation tracks');

      // Play the animation
      const action = mixerRef.current.clipAction(retargetedClip);

      // Configure loop mode
      if (animationType === 'jump' || animationType === 'wave') {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      } else {
        action.setLoop(THREE.LoopRepeat, Infinity);
      }

      action.reset().fadeIn(0.5).play();
      currentActionRef.current = action;

      console.log('Animation started successfully');
    }

    // Cleanup
    return () => {
      if (currentActionRef.current) {
        currentActionRef.current.stop();
      }
    };
  }, [avatarGltf, animationGltf, animationType]);

  // Track frame count for debugging
  const frameCount = useRef(0);

  // Update animation mixer every frame
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);

      // Debug: Check if bones are moving (every 60 frames)
      frameCount.current++;
      if (frameCount.current % 60 === 0 && group.current) {
        let hipsFound = false;
        group.current.traverse((child: any) => {
          if (child.isBone && child.name === 'Hips') {
            console.log(`Frame ${frameCount.current} - Hips position:`,
              child.position.x.toFixed(3),
              child.position.y.toFixed(3),
              child.position.z.toFixed(3),
              'rotation:',
              child.rotation.x.toFixed(3),
              child.rotation.y.toFixed(3),
              child.rotation.z.toFixed(3)
            );
            hipsFound = true;
          }
        });

        if (!hipsFound && frameCount.current === 60) {
          console.warn('Hips bone not found in animated scene!');
        }
      }
    }
  });

  return <group ref={group} />;
}

// Main component
export function WorkingAnimator({
  avatarUrl,
  characterId,
  animationType = 'idle'
}: {
  avatarUrl: string;
  characterId: string;
  animationType?: string;
}) {
  return (
    <div id={`avatar-${characterId}`} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{
          position: [0, 1.5, 3],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        <AnimatedAvatar avatarUrl={avatarUrl} animationType={animationType} />

        <OrbitControls
          target={[0, 1, 0]}
          enablePan={false}
          minDistance={2}
          maxDistance={5}
        />
      </Canvas>
    </div>
  );
}