import { useState, useCallback, useRef } from 'react';
import { Heart } from 'lucide-react';

/**
 * SupportButton — "I face this too" tap button with satisfying micro-interaction.
 * Scale + color fill + ripple on tap.
 */
export default function SupportButton({
  count = 0,
  supported = false,
  disabled = false,
  ownPost = false,
  onToggle,
  size = 'default',
}) {
  const [animating, setAnimating] = useState(false);
  const [particles, setParticles] = useState([]);
  const btnRef = useRef(null);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (disabled || ownPost) return;

    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    // Burst particles on support
    if (!supported) {
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i * 60) + Math.random() * 30,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 600);
    }

    onToggle?.();
  }, [disabled, ownPost, supported, onToggle]);

  const isSmall = size === 'small';
  const iconSize = isSmall ? 14 : 18;

  return (
    <button
      ref={btnRef}
      className={`support-btn ${supported ? 'supported' : ''} ${animating ? 'animating' : ''} ${disabled || ownPost ? 'disabled' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      title={ownPost ? "You can't support your own post" : supported ? 'Remove support' : 'I face this too!'}
      style={{
        '--btn-size': isSmall ? '32px' : '40px',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '4px' : '6px',
        padding: isSmall ? '4px 10px' : '6px 14px',
        border: 'none',
        borderRadius: '20px',
        fontSize: isSmall ? '12px' : '14px',
        fontWeight: 700,
        cursor: disabled || ownPost ? 'default' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        background: supported ? 'var(--brand-saffron)' : 'var(--bg-tertiary)',
        color: supported ? '#fff' : 'var(--text-secondary)',
        transform: animating ? 'scale(1.15)' : 'scale(1)',
        opacity: disabled || ownPost ? 0.5 : 1,
        outline: 'none',
        overflow: 'visible',
      }}
    >
      <Heart
        size={iconSize}
        fill={supported ? '#fff' : 'none'}
        strokeWidth={supported ? 0 : 2}
        style={{
          transition: 'all 0.2s ease',
          filter: supported ? 'drop-shadow(0 0 4px rgba(255,255,255,0.4))' : 'none',
        }}
      />
      <span>{count}</span>

      {/* Burst particles */}
      {particles.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'var(--brand-saffron)',
            pointerEvents: 'none',
            animation: 'support-particle 0.5s ease-out forwards',
            '--angle': `${p.angle}deg`,
          }}
        />
      ))}
    </button>
  );
}
