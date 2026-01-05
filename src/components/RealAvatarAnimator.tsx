import React, { useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Component to load and display the avatar with animations
function AnimatedAvatar({
  avatarUrl,
  animationType = 'idle'
}: {
  avatarUrl: string;
  animationType: string;
}) {
  const group = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentAction = useRef<THREE.AnimationAction | null>(null);
  const avatarRef = useRef<THREE.Object3D | null>(null);

  // Load the avatar model
  const avatar = useGLTF(avatarUrl);

  // Map animation types to URLs
  const animationMap: { [key: string]: string } = {
    'idle': '/animations/idle.glb',
    'walk': '/animations/walk.glb',
    'run': '/animations/run.glb',
    'jump': '/animations/jump.glb',
    'dance': '/animations/dance.glb',
    'wave': '/animations/wave.glb',
    'sit': '/animations/idle.glb', // Using idle as placeholder
    'clap': '/animations/wave.glb', // Using wave as placeholder
    'nod': '/animations/wave.glb',
    'shake': '/animations/idle.glb'
  };

  const animationUrl = animationMap[animationType] || '/animations/idle.glb';

  // Load the animation file
  const animationGltf = useGLTF(animationUrl);

  // Setup the avatar in the scene FIRST
  useEffect(() => {
    if (!avatar.scene || !group.current) return;

    // Clear existing children
    while (group.current.children.length > 0) {
      group.current.remove(group.current.children[0]);
    }

    // Clone and add the avatar
    const avatarClone = avatar.scene.clone();
    avatarRef.current = avatarClone;
    group.current.add(avatarClone);

    // Debug: Check if avatar has SkinnedMesh
    let hasSkinnedMesh = false;
    avatarClone.traverse((child: any) => {
      if (child.isSkinnedMesh) {
        hasSkinnedMesh = true;
        console.log('Found SkinnedMesh:', child.name, 'with skeleton bones:', child.skeleton.bones.length);
      }
    });

    if (!hasSkinnedMesh) {
      console.warn('No SkinnedMesh found in avatar!');
    }

    console.log('Avatar added to scene');

    // Create mixer for the cloned avatar
    if (!mixerRef.current && avatarRef.current) {
      mixerRef.current = new THREE.AnimationMixer(avatarRef.current);
      console.log('Created new AnimationMixer for cloned avatar');
    }

  }, [avatar.scene]);

  // Initialize and play animations
  useEffect(() => {
    if (!avatarRef.current || !animationGltf.animations.length || !mixerRef.current) {
      console.log('Waiting for avatar/animations/mixer:', {
        hasAvatar: !!avatarRef.current,
        animationCount: animationGltf.animations.length,
        hasMixer: !!mixerRef.current
      });
      return;
    }

    const mixer = mixerRef.current;

    // Debug: Check avatar's bone structure
    const avatarBones: string[] = [];
    avatarRef.current.traverse((child: any) => {
      if (child.isBone) {
        avatarBones.push(child.name);
      }
    });
    console.log('Avatar bones found:', avatarBones.length, avatarBones.slice(0, 5));

    // Debug: Check animation's target bones
    const animClip = animationGltf.animations[0];
    if (animClip) {
      const trackNames = animClip.tracks.map(track => track.name);
      console.log('Animation targets:', trackNames.slice(0, 5));
    }

    // Stop current animation
    if (currentAction.current) {
      currentAction.current.fadeOut(0.5);
    }

    // Play new animation
    const clip = animationGltf.animations[0];
    console.log('Animation clip:', clip?.name, 'Duration:', clip?.duration);

    if (clip) {
      // Apply the animation to the cloned avatar
      const action = mixer.clipAction(clip, avatarRef.current);

      // Configure the action
      action.reset();
      action.fadeIn(0.5);

      // Set loop mode
      if (animationType === 'jump' || animationType === 'wave') {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      } else {
        action.setLoop(THREE.LoopRepeat, Infinity);
      }

      action.play();
      currentAction.current = action;
      console.log('Started playing animation:', animationType, 'on cloned avatar');
    }

    return () => {
      // Cleanup on unmount
      if (currentAction.current) {
        currentAction.current.stop();
      }
    };
  }, [animationGltf.animations, animationType, avatarRef.current, mixerRef.current]);

  // Update animation mixer
  const frameCount = useRef(0);
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);

      // Log every 60 frames (approximately once per second at 60fps)
      frameCount.current++;
      if (frameCount.current % 60 === 0) {
        console.log('Mixer updating, frame:', frameCount.current, 'delta:', delta);

        // Extra debug: check if any bone is actually moving
        if (frameCount.current === 60 && avatarRef.current) {
          let hasBones = false;
          avatarRef.current.traverse((child: any) => {
            if (child.isBone && child.name === 'Hips') {
              console.log('Hips position:', child.position.toArray());
              console.log('Hips rotation:', child.rotation.toArray());
              hasBones = true;
            }
          });
          if (!hasBones) {
            console.warn('No bones found in avatar during animation!');
          }
        }
      }
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]} scale={[1, 1, 1]} />
  );
}

// Main component with Canvas
export function RealAvatarAnimator({
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

        <Suspense fallback={null}>
          <AnimatedAvatar avatarUrl={avatarUrl} animationType={animationType} />
        </Suspense>

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

// Preload all animation files
export function preloadAnimations() {
  const animations = [
    '/animations/idle.glb',
    '/animations/walk.glb',
    '/animations/run.glb',
    '/animations/jump.glb',
    '/animations/dance.glb',
    '/animations/wave.glb'
  ];

  animations.forEach(url => {
    useGLTF.preload(url);
  });
}