import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Component to display avatar with animations
function AnimatedAvatar({
  avatarUrl,
  animationType = 'idle'
}: {
  avatarUrl: string;
  animationType?: string;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene: avatarScene } = useGLTF(avatarUrl);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<{ [key: string]: THREE.AnimationAction }>({});
  const [animationsLoaded, setAnimationsLoaded] = useState<Set<string>>(new Set());
  const skinnedMeshRef = useRef<any>(null);
  const lipSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Build animation URL
  const getAnimationUrl = (type: string) => `/animations/${type}.glb`;

  // Start lip sync animation
  const startLipSync = () => {
    if (!skinnedMeshRef.current || !skinnedMeshRef.current.morphTargetDictionary) return;

    const mesh = skinnedMeshRef.current;
    const dict = mesh.morphTargetDictionary;

    // Available visemes for lip sync
    const visemes = [
      'viseme_sil', 'viseme_PP', 'viseme_FF', 'viseme_TH',
      'viseme_DD', 'viseme_kk', 'viseme_CH', 'viseme_SS', 'viseme_nn',
      'mouthOpen'
    ];

    // Filter to only available visemes
    const availableVisemes = visemes.filter(v => dict[v] !== undefined);

    if (availableVisemes.length === 0) return;

    // Animate mouth randomly to simulate talking
    lipSyncIntervalRef.current = setInterval(() => {
      // Reset all visemes
      availableVisemes.forEach(viseme => {
        const index = dict[viseme];
        if (index !== undefined) {
          mesh.morphTargetInfluences[index] = 0;
        }
      });

      // Randomly activate 1-2 visemes
      const numVisemes = Math.random() > 0.7 ? 2 : 1;
      for (let i = 0; i < numVisemes; i++) {
        const randomViseme = availableVisemes[Math.floor(Math.random() * availableVisemes.length)];
        const index = dict[randomViseme];
        if (index !== undefined) {
          // Random intensity between 0.3 and 1.0
          mesh.morphTargetInfluences[index] = 0.3 + Math.random() * 0.7;
        }
      }

      // Sometimes close mouth completely (silence)
      if (Math.random() > 0.8) {
        availableVisemes.forEach(viseme => {
          const index = dict[viseme];
          if (index !== undefined) {
            mesh.morphTargetInfluences[index] = 0;
          }
        });
      }
    }, 100); // Change mouth shape every 100ms
  };

  // Stop lip sync animation
  const stopLipSync = () => {
    if (lipSyncIntervalRef.current) {
      clearInterval(lipSyncIntervalRef.current);
      lipSyncIntervalRef.current = null;
    }

    // Reset all morph targets
    if (skinnedMeshRef.current && skinnedMeshRef.current.morphTargetDictionary) {
      const mesh = skinnedMeshRef.current;
      const dict = mesh.morphTargetDictionary;
      Object.keys(dict).forEach(key => {
        const index = dict[key];
        if (index !== undefined) {
          mesh.morphTargetInfluences[index] = 0;
        }
      });
    }
  };

  // Dynamically load animation when requested
  const loadAnimation = async (animType: string) => {
    if (animationsLoaded.has(animType) || !mixerRef.current || !group.current) return;

    try {
      const url = getAnimationUrl(animType);
      // Load the animation GLB file
      const loader = new GLTFLoader();

      loader.load(
        url,
        (gltf) => {
          if (gltf.animations && gltf.animations.length > 0 && mixerRef.current && group.current) {
            const clip = gltf.animations[0].clone();

            // Keep avatar in place while animating
            clip.tracks.forEach((track: any) => {
              if (track.name === 'Hips.position') {
                const values = track.values;
                const itemSize = 3;
                // Zero out Z (forward) movement
                for (let i = 2; i < values.length; i += itemSize) {
                  values[i] = 0;
                }
              }
            });

            // Find the avatar (not the group) to apply the animation to
            const avatar = group.current.children[0];
            if (avatar) {
              const action = mixerRef.current.clipAction(clip, avatar);
              actionsRef.current[animType] = action;
              setAnimationsLoaded(prev => new Set(prev).add(animType));
            }
          }
        },
        undefined,
        (error: any) => {
          console.warn(`Failed to load animation ${animType}:`, error);
        }
      );
    } catch (error) {
      console.warn(`Failed to load animation ${animType}:`, error);
    }
  };

  // Setup avatar once
  useEffect(() => {
    if (!avatarScene || !group.current) return;

    // Clear group
    while (group.current.children.length > 0) {
      group.current.remove(group.current.children[0]);
    }

    // DON'T CLONE - use the original scene directly
    const avatar = avatarScene;
    group.current.add(avatar);

    // Create mixer for this avatar
    mixerRef.current = new THREE.AnimationMixer(avatar);

    // Verify SkinnedMesh setup and check for blend shapes
    let skinnedMesh: any = null;
    let hasBlendShapes = false;
    avatar.traverse((child: any) => {
      if (child.isSkinnedMesh) {
        skinnedMesh = child;
        skinnedMeshRef.current = child;

        // Check for morph targets (blend shapes) for facial animation
        if (child.morphTargetDictionary && child.morphTargetInfluences) {
          hasBlendShapes = true;
          const morphTargets = Object.keys(child.morphTargetDictionary);
          console.log('Found blend shapes:', morphTargets.length, 'targets');

          // List some blend shapes for debugging
          const facialTargets = morphTargets.filter(name =>
            name.includes('mouth') || name.includes('lip') ||
            name.includes('eye') || name.includes('brow') ||
            name.includes('viseme') || name.includes('jaw')
          );

          if (facialTargets.length > 0) {
            console.log('Facial blend shapes available:', facialTargets.slice(0, 10));
          } else {
            console.log('No facial blend shapes found. Available:', morphTargets.slice(0, 10));
          }
        }
      }
    });

    if (!skinnedMesh) {
      console.error('No SkinnedMesh found in avatar!');
    }

    if (!hasBlendShapes) {
      console.log('No blend shapes/morph targets found - lip sync not available');
    }

    // Load idle animation by default
    loadAnimation('idle');

    return () => {
      stopLipSync();
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current.uncacheRoot(avatar);
      }
    };
  }, [avatarScene]);

  // Play the selected animation
  useEffect(() => {
    if (!mixerRef.current) return;

    const currentAnimationType = animationType || 'idle';

    // Load animation if not already loaded
    if (!actionsRef.current[currentAnimationType]) {
      loadAnimation(currentAnimationType);
      return;
    }

    // Stop all animations
    Object.values(actionsRef.current).forEach(action => {
      action.stop();
    });

    // Stop any existing lip sync
    stopLipSync();

    // Play the selected animation
    const action = actionsRef.current[currentAnimationType];
    if (action) {
      action.reset();
      action.fadeIn(0.5);

      // Set loop mode - single play for certain animations
      const singlePlayAnimations = ['jump', 'wave', 'fall', 'happy', 'sad',
                                    'angry', 'surprised', 'think', 'confused'];
      if (singlePlayAnimations.includes(currentAnimationType)) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      } else {
        action.setLoop(THREE.LoopRepeat, Infinity);
      }

      action.play();
      console.log('Animation switched to:', currentAnimationType);

      // Start lip sync for talking animations
      const talkingAnimations = ['talk', 'talk2', 'talk3', 'talk4', 'talk5'];
      if (talkingAnimations.includes(currentAnimationType)) {
        console.log('Starting lip sync for talking animation');
        startLipSync();
      }
    }
  }, [animationType, animationsLoaded]);

  // Update mixer
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);

      // Force SkinnedMesh to update
      if (group.current) {
        group.current.traverse((child: any) => {
          if (child.isSkinnedMesh) {
            child.skeleton.update();
            child.computeBoundingSphere();
          }
        });
      }
    }
  });

  return <group ref={group} position={[0, 0, 0]} />;
}

// Preload common animations
const PRELOAD_ANIMATIONS = ['idle', 'walk', 'run', 'jump', 'wave', 'dance'];
PRELOAD_ANIMATIONS.forEach(anim => {
  useGLTF.preload(`/animations/${anim}.glb`);
});

// Main component
export function FinalAnimator({
  avatarUrl,
  characterId,
  animationType
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