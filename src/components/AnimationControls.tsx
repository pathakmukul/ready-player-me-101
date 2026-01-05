interface Props {
  onAnimationChange: (animationType: string | undefined) => void;
}

// All 45 animations organized by category
const ANIMATIONS = [
  // Basic Movement
  { name: '🧍 Idle', type: 'idle', category: 'basic' },
  { name: '🚶 Walk', type: 'walk', category: 'basic' },
  { name: '🏃 Run', type: 'run', category: 'basic' },
  { name: '🦘 Jump', type: 'jump', category: 'basic' },

  // Advanced Movement
  { name: '🏃‍♂️ Jog', type: 'jog', category: 'movement' },
  { name: '🚶‍♂️ Walk 2', type: 'walk2', category: 'movement' },
  { name: '🏃 Run 2', type: 'run2', category: 'movement' },
  { name: '⬅️ Strafe Left', type: 'strafe_left', category: 'movement' },
  { name: '➡️ Strafe Right', type: 'strafe_right', category: 'movement' },
  { name: '🔙 Walk Back', type: 'walk_backward', category: 'movement' },
  { name: '⏪ Jog Back', type: 'jog_backward', category: 'movement' },
  { name: '🦐 Crouch', type: 'crouch', category: 'movement' },
  { name: '🪂 Fall', type: 'fall', category: 'movement' },

  // Idle Variations
  { name: '😌 Idle 2', type: 'idle2', category: 'idle' },
  { name: '😎 Idle 3', type: 'idle3', category: 'idle' },
  { name: '🧘 Idle 4', type: 'idle4', category: 'idle' },
  { name: '🤔 Idle 5', type: 'idle5', category: 'idle' },
  { name: '😴 Idle 6', type: 'idle6', category: 'idle' },
  { name: '🥱 Idle 7', type: 'idle7', category: 'idle' },

  // Expressions & Emotions
  { name: '😊 Happy', type: 'happy', category: 'expression' },
  { name: '😢 Sad', type: 'sad', category: 'expression' },
  { name: '😠 Angry', type: 'angry', category: 'expression' },
  { name: '😲 Surprised', type: 'surprised', category: 'expression' },
  { name: '🤔 Think', type: 'think', category: 'expression' },
  { name: '😕 Confused', type: 'confused', category: 'expression' },

  // Gestures & Communication
  { name: '👋 Wave', type: 'wave', category: 'gesture' },
  { name: '💬 Talk 1', type: 'talk', category: 'gesture' },
  { name: '🗣️ Talk 2', type: 'talk2', category: 'gesture' },
  { name: '📢 Talk 3', type: 'talk3', category: 'gesture' },
  { name: '💭 Talk 4', type: 'talk4', category: 'gesture' },
  { name: '🗨️ Talk 5', type: 'talk5', category: 'gesture' },

  // Dance Moves
  { name: '💃 Dance 1', type: 'dance', category: 'dance' },
  { name: '🕺 Dance 2', type: 'dance2', category: 'dance' },
  { name: '🎶 Dance 3', type: 'dance3', category: 'dance' },
  { name: '🎵 Dance 4', type: 'dance4', category: 'dance' },
  { name: '🎸 Dance 5', type: 'dance5', category: 'dance' },
  { name: '🎤 Dance 6', type: 'dance6', category: 'dance' },
  { name: '🎺 Dance 7', type: 'dance7', category: 'dance' },
  { name: '🎷 Dance 8', type: 'dance8', category: 'dance' },
  { name: '🎹 Dance 9', type: 'dance9', category: 'dance' },
  { name: '🥁 Dance 10', type: 'dance10', category: 'dance' },
  { name: '🎻 Dance 11', type: 'dance11', category: 'dance' },
  { name: '🪕 Dance 12', type: 'dance12', category: 'dance' },
  { name: '🎼 Dance 13', type: 'dance13', category: 'dance' },
];

export function AnimationControls({ onAnimationChange }: Props) {
  // Group animations by category
  const categories = ['basic', 'movement', 'idle', 'expression', 'gesture', 'dance'];
  const categoryLabels: { [key: string]: string } = {
    'basic': 'Basic Movement',
    'movement': 'Advanced Movement',
    'idle': 'Idle Variations',
    'expression': 'Emotions',
    'gesture': 'Communication',
    'dance': 'Dance Moves'
  };

  const groupedAnimations = categories.reduce((acc, cat) => {
    acc[cat] = ANIMATIONS.filter(anim => anim.category === cat);
    return acc;
  }, {} as Record<string, typeof ANIMATIONS>);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      maxHeight: '600px',
      overflowY: 'auto'
    }}>
      <div style={{
        padding: '10px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '6px',
        marginBottom: '10px'
      }}>
        <p style={{
          fontSize: '14px',
          color: 'white',
          margin: 0,
          fontWeight: '600'
        }}>
          🎮 45 Animations Available!
        </p>
        <p style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.9)',
          margin: '4px 0 0 0'
        }}>
          Click any button to animate your avatar
        </p>
      </div>

      {Object.entries(groupedAnimations).map(([category, animations]) => {
        if (animations.length === 0) return null;
        return (
          <div key={category}>
            <h4 style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              color: '#9ca3af',
              marginBottom: '8px',
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}>
              {categoryLabels[category]} ({animations.length})
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '6px'
            }}>
              {animations.map((anim) => (
                <button
                  key={anim.type}
                  onClick={() => {
                    console.log(`Playing animation: ${anim.name} (${anim.type})`);
                    onAnimationChange(anim.type);
                  }}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={anim.name}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {anim.name}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}