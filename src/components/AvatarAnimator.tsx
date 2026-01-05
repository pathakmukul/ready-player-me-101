import { useEffect, useRef } from 'react';
import { Avatar } from '@readyplayerme/visage';

interface Props {
  avatarUrl: string;
  characterId: string;
  animationType?: string;
}

export function AvatarAnimator({ avatarUrl, characterId, animationType }: Props) {
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (!animationType || animationType === 'idle') {
      return;
    }

    // Start animation based on type
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000; // Convert to seconds

      // Get the avatar container
      const container = document.querySelector(`#avatar-${characterId}`) as HTMLElement;
      if (!container) return;

      switch (animationType) {
        case 'wave':
          // Simple wave animation - rotate the whole avatar slightly
          const waveAngle = Math.sin(elapsed * 3) * 10;
          container.style.transform = `rotateZ(${waveAngle}deg)`;
          break;

        case 'jump':
          // Jump animation - move up and down
          const jumpHeight = Math.max(0, Math.sin(elapsed * 4) * 50);
          container.style.transform = `translateY(-${jumpHeight}px)`;
          break;

        case 'spin':
          // Spin animation - rotate around Y axis
          const spinAngle = (elapsed * 180) % 360;
          container.style.transform = `rotateY(${spinAngle}deg)`;
          break;

        case 'dance':
          // Dance animation - combine rotation and scale
          const danceRotation = Math.sin(elapsed * 5) * 15;
          const danceScale = 1 + Math.sin(elapsed * 10) * 0.05;
          container.style.transform = `rotateY(${danceRotation}deg) scale(${danceScale})`;
          break;

        case 'walk':
          // Walk animation - slight bobbing and swaying
          const walkBob = Math.sin(elapsed * 8) * 5;
          const walkSway = Math.sin(elapsed * 4) * 3;
          container.style.transform = `translateY(-${walkBob}px) rotateZ(${walkSway}deg)`;
          break;

        case 'run':
          // Run animation - faster bobbing
          const runBob = Math.sin(elapsed * 12) * 8;
          const runSway = Math.sin(elapsed * 6) * 5;
          container.style.transform = `translateY(-${runBob}px) rotateZ(${runSway}deg)`;
          break;

        case 'sit':
          // Sit animation - scale down slightly and move down
          container.style.transform = `scaleY(0.8) translateY(20px)`;
          break;

        case 'clap':
          // Clap animation - pulse effect
          const clapScale = 1 + Math.abs(Math.sin(elapsed * 6)) * 0.1;
          container.style.transform = `scale(${clapScale})`;
          break;

        case 'nod':
          // Nod animation - rotate around X axis
          const nodAngle = Math.sin(elapsed * 3) * 20;
          container.style.transform = `rotateX(${nodAngle}deg)`;
          break;

        case 'shake':
          // Shake head animation - rotate around Y axis quickly
          const shakeAngle = Math.sin(elapsed * 10) * 10;
          container.style.transform = `rotateY(${shakeAngle}deg)`;
          break;

        default:
          container.style.transform = 'none';
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Reset transform when animation stops
      const container = document.querySelector(`#avatar-${characterId}`) as HTMLElement;
      if (container) {
        container.style.transform = 'none';
      }
    };
  }, [animationType, characterId]);

  return (
    <div
      id={`avatar-${characterId}`}
      style={{
        width: '100%',
        height: '100%',
        transition: animationType === 'sit' ? 'transform 0.5s' : 'none'
      }}
    >
      <Avatar
        modelSrc={avatarUrl}
        cameraInitialDistance={2.5}
        cameraTarget={1.5}
        shadows={false}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent'
        }}
      />
    </div>
  );
}