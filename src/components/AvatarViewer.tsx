import { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar } from '@readyplayerme/visage';

interface Props {
  avatarUrl: string;
  characterId: string;
  characterName: string;
  animationSrc?: string;
}

export function AvatarViewer({ avatarUrl, characterId, characterName, animationSrc }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  // Handle WebGL context loss
  useEffect(() => {
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.log('WebGL context lost, will retry...');
      setHasError(true);

      // Retry after a delay
      setTimeout(() => {
        if (mountedRef.current && retryCount < 3) {
          console.log(`Retrying avatar load (attempt ${retryCount + 1}/3)`);
          setRetryCount(prev => prev + 1);
          setHasError(false);
          setIsLoading(true);
        }
      }, 1000);
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      setHasError(false);
      setIsLoading(true);
    };

    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);

      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      };
    }
  }, [retryCount]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleLoaded = useCallback(() => {
    console.log('Avatar loaded successfully');
    console.log('Model URL:', avatarUrl);
    setIsLoading(false);
    setHasError(false);
  }, [avatarUrl]);

  // Reset state when avatar URL changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [avatarUrl]);

  if (hasError && retryCount >= 3) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#999',
        padding: '20px'
      }}>
        <p>Failed to load avatar after multiple attempts</p>
        <button
          onClick={() => {
            setRetryCount(0);
            setHasError(false);
            setIsLoading(true);
          }}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: 'transparent'
      }}
    >
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#999',
          zIndex: 1
        }}>
          Loading avatar...
        </div>
      )}

      <div style={{
        width: '100%',
        height: '100%',
        opacity: isLoading ? 0 : 1,
        transition: 'opacity 0.3s'
      }}>
        <Avatar
          key={`${characterId}-${retryCount}-${animationSrc || 'idle'}`}
          modelSrc={avatarUrl}
          animationSrc={animationSrc}
          cameraInitialDistance={2.5}
          cameraTarget={1.5}
          onLoaded={handleLoaded}
          shadows={false}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent'
          }}
        />
      </div>
    </div>
  );
}