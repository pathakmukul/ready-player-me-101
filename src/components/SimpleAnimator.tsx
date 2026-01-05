import React, { useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// Component that displays the animation file's model directly with its animation
function AnimatedModel({ animationType = 'idle' }: { animationType: string }) {
  const group = useRef<THREE.Group>(null);

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

  // Load the GLB file (contains both model and animation)
  const { scene, animations } = useGLTF(animationUrl);

  // Setup animations using drei's useAnimations hook
  const { actions, mixer } = useAnimations(animations, group);

  // Debug scene
  useEffect(() => {
    console.log('Scene loaded:', scene);
    console.log('Scene children:', scene.children.length);

    // Check what's in the scene
    let meshFound = false;
    let boneCount = 0;
    scene.traverse((child: any) => {
      if (child.isMesh || child.isSkinnedMesh) {
        console.log('Found mesh:', child.name, child.type);
        meshFound = true;
      }
      if (child.isBone) {
        boneCount++;
      }
      if (child.name === 'Armature' || child.type === 'Bone') {
        console.log('Found skeleton/bone structure:', child.name, child.type);
      }
    });

    console.log('Total bones found:', boneCount);

    if (!meshFound) {
      console.warn('No mesh found in animation file - this is just a skeleton with animations!');
    }
  }, [scene]);

  // Play the animation
  useEffect(() => {
    console.log('Loading animation:', animationType);
    console.log('Available animations:', Object.keys(actions));

    // Play the first animation in the file
    const actionName = Object.keys(actions)[0];
    if (actionName && actions[actionName]) {
      const action = actions[actionName];
      if (action) {
        action.reset().fadeIn(0.5).play();

        // Set loop mode
        if (animationType === 'jump' || animationType === 'wave') {
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
        } else {
          action.setLoop(THREE.LoopRepeat, Infinity);
        }

        console.log('Playing animation:', actionName);
      }
    }

    // Cleanup
    return () => {
      Object.values(actions).forEach(action => {
        action?.stop();
      });
    };
  }, [actions, animationType]);

  return <primitive object={scene} ref={group} />;
}

// Main component
export function SimpleAnimator({
  avatarUrl,
  characterId,
  animationType = 'idle'
}: {
  avatarUrl: string;
  characterId: string;
  animationType?: string;
}) {
  console.log('SimpleAnimator rendering with animation:', animationType);

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
          <AnimatedModel animationType={animationType} />
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