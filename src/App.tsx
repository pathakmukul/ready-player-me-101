import { useState, useEffect } from 'react';
import { AvatarCreatorPanel } from './components/AvatarCreator';
import { FinalAnimator } from './components/FinalAnimator';
import { AnimationControls } from './components/AnimationControls';
import { Character } from './types';
import './App.css';

// No demo avatars - users must create their own through Ready Player Me
const DEMO_AVATARS: { name: string; url: string }[] = [];

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  // Load saved characters from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('rpm-characters');
    if (saved) {
      try {
        const parsedCharacters = JSON.parse(saved);
        // Filter out any characters with invalid URLs AND fix missing currentAnimation
        const validCharacters = parsedCharacters.filter((char: Character) => {
          // Only keep characters with valid Ready Player Me URLs
          return char.avatarUrl &&
                 (char.avatarUrl.includes('.glb') || char.avatarUrl.includes('.json')) &&
                 !char.avatarUrl.includes('outfit=outfit_'); // Remove old broken URLs
        }).map((char: Character) => ({
          ...char,
          currentAnimation: 'idle' // FORCE idle for all loaded characters
        }));
        setCharacters(validCharacters);

        // Clean up localStorage if we filtered out bad data
        if (validCharacters.length !== parsedCharacters.length) {
          localStorage.setItem('rpm-characters', JSON.stringify(validCharacters));
          console.log('Cleaned up invalid avatar URLs from storage');
        }
      } catch (e) {
        console.error('Failed to load saved characters:', e);
        // Clear corrupted data
        localStorage.removeItem('rpm-characters');
      }
    }
  }, []);

  // Save characters to localStorage whenever they change
  useEffect(() => {
    if (characters.length > 0) {
      localStorage.setItem('rpm-characters', JSON.stringify(characters));
    }
  }, [characters]);

  const addCharacter = (avatarUrl: string, name?: string) => {
    // Validate the URL is a proper Ready Player Me avatar URL
    if (!avatarUrl ||
        !avatarUrl.includes('.glb') ||
        avatarUrl.includes('outfit=outfit_')) {
      console.error('Invalid avatar URL:', avatarUrl);
      return;
    }

    const newCharacter: Character = {
      id: crypto.randomUUID(),
      name: name || `Character ${characters.length + 1}`,
      avatarUrl,
      currentAnimation: 'idle', // Start with idle pose explicitly
    };
    setCharacters(prev => [...prev, newCharacter]);
    setSelectedCharacterId(newCharacter.id);
    setShowCreator(false);
  };

  const updateCharacterAnimation = (id: string, animationType: string | undefined) => {
    setCharacters(prev => prev.map(char =>
      char.id === id ? { ...char, currentAnimation: animationType } : char
    ));
  };

  const removeCharacter = (id: string) => {
    setCharacters(prev => prev.filter(char => char.id !== id));
    if (selectedCharacterId === id) {
      setSelectedCharacterId(null);
    }
  };

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎭 Ready Player Me - Character Animator</h1>
        <p>Create and animate 3D avatars in real-time!</p>
      </header>

      <div className="main-container">
        {/* Left Panel - Character List */}
        <div className="characters-panel">
          <div className="panel-header">
            <h2>Characters</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreator(true)}
            >
              + Create Avatar
            </button>
          </div>

          {/* Getting Started */}
          {characters.length === 0 && (
            <div className="demo-section">
              <p className="demo-text">Get started:</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreator(true)}
                style={{ width: '100%', marginBottom: '10px' }}
              >
                Create Your First Avatar
              </button>
              <p className="demo-text" style={{ fontSize: '0.85rem', color: '#888' }}>
                Use Ready Player Me to create a custom 3D avatar
              </p>
            </div>
          )}

          {/* Character List */}
          <div className="character-list">
            {characters.map(char => (
              <div
                key={char.id}
                className={`character-item ${selectedCharacterId === char.id ? 'selected' : ''}`}
                onClick={() => setSelectedCharacterId(char.id)}
              >
                <span className="character-name">{char.name}</span>
                <button
                  className="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCharacter(char.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Avatar Display */}
        <div className="avatar-display">
          {showCreator ? (
            <div className="creator-container">
              <div className="creator-header">
                <h2>Create Your Avatar</h2>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCreator(false)}
                >
                  Cancel
                </button>
              </div>
              <AvatarCreatorPanel
                onAvatarCreated={(url) => addCharacter(url)}
              />
            </div>
          ) : selectedCharacter ? (
            <>
              <div className="avatar-viewport">
                {selectedCharacter.avatarUrl ? (
                  <FinalAnimator
                    avatarUrl={selectedCharacter.avatarUrl}
                    characterId={selectedCharacter.id}
                    animationType={selectedCharacter.currentAnimation || 'idle'}
                  />
                ) : (
                  <div style={{ padding: '20px', color: '#999' }}>
                    Avatar URL not available
                  </div>
                )}
              </div>
              <div className="character-info">
                <h3>{selectedCharacter.name}</h3>
                <p className="animation-status">
                  {selectedCharacter.currentAnimation ? '🎬 Playing animation' : '🧍 Idle pose'}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                  {selectedCharacter.avatarUrl}
                </p>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h2>Welcome! 👋</h2>
              <p>Create a new avatar or load a demo character to get started.</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreator(true)}
              >
                Create Your Avatar
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Animation Controls */}
        {selectedCharacter && !showCreator && (
          <div className="controls-panel">
            <h2>Animations</h2>
            <AnimationControls
              onAnimationChange={(type) => updateCharacterAnimation(selectedCharacter.id, type)}
            />
            <div className="tips">
              <h3>💡 Tips</h3>
              <ul>
                <li>Click any animation button to play</li>
                <li>Click "Idle" to return to default pose</li>
                <li>Animations loop automatically</li>
                <li>Create multiple characters to compare</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
