import { Avatar } from '@readyplayerme/visage';

interface Props {
  modelUrl: string;
  animationUrl?: string;
}

export function AvatarScene({ modelUrl, animationUrl }: Props) {
  return (
    <div style={{ width: '400px', height: '600px' }}>
      <Avatar
        modelSrc={modelUrl}
        animationSrc={animationUrl}  // Pass animation URL to play
        cameraInitialDistance={3}
        cameraTarget={1.5}  // Look at chest level
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}