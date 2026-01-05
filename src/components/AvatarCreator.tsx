import { useState } from 'react';
import { AvatarCreator, AvatarExportedEvent } from '@readyplayerme/react-avatar-creator';
import { TextToAvatar } from './TextToAvatar';

interface Props {
  onAvatarCreated: (url: string) => void;
}

export function AvatarCreatorPanel({ onAvatarCreated }: Props) {
  const [mode, setMode] = useState<'visual' | 'text'>('visual');

  const handleExport = (event: AvatarExportedEvent) => {
    // URL looks like: https://models.readyplayer.me/[id].glb
    console.log('Avatar exported:', event.data);
    console.log('Avatar URL:', event.data.url);
    onAvatarCreated(event.data.url);
  };

  const handleTextAvatarConfig = (config: any) => {
    console.log('Text-based avatar config:', config);
    // Don't try to load an avatar since we're just showing a demo
    // onAvatarCreated(config.url);
  };

  return (
    <div style={{ height: '100%' }}>
      {/* Mode selector */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '15px',
        padding: '10px',
        backgroundColor: '#1f2937',
        borderRadius: '8px'
      }}>
        <button
          onClick={() => setMode('visual')}
          style={{
            padding: '8px 16px',
            backgroundColor: mode === 'visual' ? '#3b82f6' : '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Visual Creator
        </button>
        <button
          onClick={() => setMode('text')}
          style={{
            padding: '8px 16px',
            backgroundColor: mode === 'text' ? '#3b82f6' : '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Text to Avatar
        </button>
      </div>

      {/* Content based on mode */}
      {mode === 'visual' ? (
        <AvatarCreator
          subdomain="demo"  // Use "demo" for testing
          config={{
            bodyType: 'fullbody',  // Important: fullbody for animations
            quickStart: false,
            language: 'en',
          }}
          style={{ width: '100%', height: '550px', border: 'none' }}
          onAvatarExported={handleExport}
        />
      ) : (
        <TextToAvatar onAvatarConfigReady={handleTextAvatarConfig} />
      )}
    </div>
  );
}