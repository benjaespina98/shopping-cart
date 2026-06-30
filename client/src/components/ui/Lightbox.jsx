import { useState, useEffect, useCallback, useRef } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const navBtnStyle = {
  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
  width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
  background: 'var(--surface-on-dark)', color: 'var(--text-inverse)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background var(--duration-fast) var(--ease-out)',
};

// Galería de pantalla completa con navegación por teclado, swipe y miniaturas.
// `images`: [{ src, label }]
export function Lightbox({ images, index, onClose }) {
  const [current, setCurrent] = useState(index);
  const touchStartX = useRef(null);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => { setCurrent(index); }, [index]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  if (!images.length) return null;
  const img = images[current];

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) { delta > 0 ? prev() : next(); }
    touchStartX.current = null;
  };

  return (
    <div
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
      className="ps-lightbox"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(18, 43, 51, 0.96)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <button onClick={onClose} aria-label="Cerrar" style={{
        position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%',
        border: 'none', cursor: 'pointer', background: 'var(--surface-on-dark)', color: 'var(--text-inverse)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <FiX size={20} />
      </button>

      {images.length > 1 && (
        <div style={{
          position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)',
          color: 'var(--text-inverse-muted)', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
        }}>
          {current + 1} / {images.length}
        </div>
      )}

      {images.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Foto anterior" style={{ ...navBtnStyle, left: 12 }}>
          <FiChevronLeft size={24} />
        </button>
      )}

      <img
        key={img.src}
        src={img.src}
        alt={img.label || ''}
        onClick={(e) => e.stopPropagation()}
        className="ps-lightbox-img"
        style={{
          maxWidth: '88vw', maxHeight: '78vh', objectFit: 'contain',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', display: 'block',
        }}
      />

      {images.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Foto siguiente" style={{ ...navBtnStyle, right: 12 }}>
          <FiChevronRight size={24} />
        </button>
      )}

      {img.label && (
        <p style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          color: 'var(--text-inverse-muted)', fontSize: 13, fontFamily: 'var(--font-body)',
          textAlign: 'center', maxWidth: '80vw', padding: '0 12px',
        }}>
          {img.label}
        </p>
      )}
    </div>
  );
}
