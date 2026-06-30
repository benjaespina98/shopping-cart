import { useState } from 'react';

const overlayGradient = 'linear-gradient(180deg, rgba(18,43,51,0) 55%, rgba(18,43,51,0.78) 100%)';

export function Photo({ label = 'Foto de piscina', height = 240, radius = 'var(--radius-lg)', src, zoom = false, style }) {
  const [hovered, setHovered] = useState(false);

  const hoverHandlers = zoom ? {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  } : {};

  if (src) {
    return (
      <div style={{ position: 'relative', height, borderRadius: radius, overflow: 'hidden', ...style }} {...hoverHandlers}>
        <img src={src} alt={label} style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          transform: zoom && hovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform var(--duration-normal) var(--ease-out)',
        }} />
        {label && (
          <>
            <div style={{ position: 'absolute', inset: 0, background: overlayGradient, pointerEvents: 'none' }} />
            <span style={{
              position: 'absolute', bottom: 14, left: 16, right: 16,
              fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--text-inverse-muted)',
            }}>{label}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative', height, borderRadius: radius, overflow: 'hidden',
      background: 'linear-gradient(160deg, var(--teal-500) 0%, var(--teal-700) 55%, var(--teal-800) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.18,
        backgroundImage: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0 2px, transparent 2px 26px)',
      }} />
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.5 }}>
        <circle cx="32" cy="20" r="11" fill="white" />
        <path d="M6 38 Q14 32 22 38 Q30 44 38 38 Q46 32 58 38" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M6 50 Q14 44 22 50 Q30 56 38 50 Q46 44 58 50" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      {label && (
        <span style={{
          position: 'absolute', bottom: 14, left: 16,
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--text-inverse-faint)',
        }}>{label}</span>
      )}
    </div>
  );
}
