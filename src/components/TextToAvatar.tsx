import { useState } from 'react';
import { AssetMapper } from '../services/assetMapper';

interface Props {
  onAvatarConfigReady?: (config: any) => void;
}

export function TextToAvatar({ onAvatarConfigReady }: Props) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const mapper = new AssetMapper();
      const avatarConfig = mapper.buildAvatarConfig(description);

      if (avatarConfig.assets.length === 0) {
        setError('No matching assets found. Try a different description.');
        setResults(null);
      } else {
        setResults(avatarConfig);

        // Note: This is a demo showing how text-to-avatar would work
        // In production, these would map to real Ready Player Me asset IDs
      }
    } catch (err) {
      setError('Failed to generate avatar configuration');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      color: 'white'
    }}>
      <h3 style={{ marginTop: 0 }}>Create Avatar from Description</h3>

      <div style={{ marginBottom: '15px' }}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your avatar... e.g., 'Indian man with black leather jacket and sunglasses'"
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #374151',
            backgroundColor: '#111827',
            color: 'white',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#4b5563' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          width: '100%'
        }}
      >
        {loading ? 'Analyzing...' : 'Generate Avatar'}
      </button>

      {error && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#dc2626',
          borderRadius: '6px',
          fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      {results && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          backgroundColor: '#374151',
          borderRadius: '6px'
        }}>
          <h4 style={{ marginTop: 0 }}>🎯 Demo Results:</h4>
          <div style={{ fontSize: '13px' }}>
            <p><strong>Gender:</strong> {results.gender}</p>
            <p><strong>Matching Items:</strong></p>
            <ul style={{ marginLeft: '20px' }}>
              {results.assets.slice(0, 5).map((asset: any) => (
                <li key={asset.id}>
                  {asset.name} ({asset.type}) - Score: {asset.score}
                </li>
              ))}
            </ul>
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#2563eb',
              borderRadius: '6px'
            }}>
              <strong>📝 How This Would Work:</strong>
              <ol style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                <li>Your description is parsed for colors, styles, and clothing types</li>
                <li>Matching assets are found from Ready Player Me's catalog</li>
                <li>An avatar URL would be generated with those real asset IDs</li>
              </ol>
              <div style={{
                marginTop: '10px',
                padding: '8px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '4px'
              }}>
                <strong>Note:</strong> To create a real avatar, use the <strong>Visual Creator</strong> tab
                which connects to Ready Player Me's actual avatar builder.
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#374151',
        borderRadius: '6px',
        fontSize: '12px'
      }}>
        <strong>Tips:</strong>
        <ul style={{ marginLeft: '20px', marginBottom: 0 }}>
          <li>Be specific about colors and styles</li>
          <li>Mention gender (man/woman) for better results</li>
          <li>Include clothing items like jacket, shirt, glasses</li>
          <li>Try: "casual man with blue jeans and white t-shirt"</li>
        </ul>
      </div>
    </div>
  );
}