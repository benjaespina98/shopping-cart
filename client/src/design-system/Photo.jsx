import { useState } from 'react';
import CldImage from '../components/ui/CldImage';

const overlayGradient = 'linear-gradient(180deg, rgba(18,43,51,0) 55%, rgba(18,43,51,0.78) 100%)';
// Mismo degradado de marca que el placeholder sin imagen: se ve al instante (0 red)
// mientras carga la foto, así el hueco nunca queda vacío.
const brandGradient = 'linear-gradient(160deg, var(--teal-500) 0%, var(--teal-700) 55%, var(--teal-800) 100%)';

export function Photo({
  label = 'Foto de piscina',
  alt,
  height = 240,
  radius = 'var(--radius-lg)',
  src,
  zoom = false,
  priority = false,
  sizes = '100vw',
  className,
  style,
}) {
  const [hovered, setHovered] = useState(false);

  const hoverHandlers = zoom ? {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  } : {};

  if (src) {
    const rootClass = ['ps-photo', className].filter(Boolean).join(' ');

    return (
      <div
        className={rootClass}
        style={{ position: 'relative', height, borderRadius: radius, overflow: 'hidden', background: brandGradient, ...style }}
        {...hoverHandlers}
      >
        {/* Blur-up, f_auto/q_auto y srcset los resuelve CldImage — misma lógica de
            carga que usan las tarjetas de producto, para no mantenerla dos veces. */}
        <CldImage
          src={src}
          alt={alt || label}
          width={1200}
          sizes={sizes}
          priority={priority}
          imgStyle={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            transform: zoom && hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'opacity var(--duration-slow) var(--ease-out), transform var(--duration-normal) var(--ease-out)',
          }}
        />
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
    <div className={['ps-photo', className].filter(Boolean).join(' ')} style={{
      position: 'relative', height, borderRadius: radius, overflow: 'hidden',
      background: brandGradient,
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
