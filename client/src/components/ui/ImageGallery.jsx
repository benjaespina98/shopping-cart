import { useState, useEffect, useCallback } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiMaximize2 } from 'react-icons/fi';

// Reemplazá estas URLs con fotos reales de tu local / las piscinas que instalaste
export const GALLERY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=1400&q=85',
    thumb: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=500&q=70',
    alt: 'Piscina de lujo con vista al jardín',
  },
  {
    url: 'https://images.unsplash.com/photo-1572331165267-854da2b021d9?w=1400&q=85',
    thumb: 'https://images.unsplash.com/photo-1572331165267-854da2b021d9?w=500&q=70',
    alt: 'Piscina rectangular moderna',
  },
  {
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1400&q=85',
    thumb: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=70',
    alt: 'Vista aérea de piscina',
  },
  {
    url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1400&q=85',
    thumb: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500&q=70',
    alt: 'Piscina en terraza',
  },
  {
    url: 'https://images.unsplash.com/photo-1527484427351-9b4f3b774365?w=1400&q=85',
    thumb: 'https://images.unsplash.com/photo-1527484427351-9b4f3b774365?w=500&q=70',
    alt: 'Piscina interior iluminada',
  },
  {
    url: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1400&q=85',
    thumb: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=500&q=70',
    alt: 'Piscina con desnivel y cascada',
  },
];

// ─── Lightbox ──────────────────────────────────────────────
function Lightbox({ images, index, onClose }) {
  const [current, setCurrent] = useState(index);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
        onClick={onClose}
      >
        <FiX size={24} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
        {current + 1} / {images.length}
      </div>

      {/* Prev */}
      <button
        className="absolute left-4 z-10 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
        onClick={(e) => { e.stopPropagation(); prev(); }}
      >
        <FiChevronLeft size={28} />
      </button>

      {/* Image */}
      <img
        src={images[current].url}
        alt={images[current].alt}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      <button
        className="absolute right-4 z-10 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
        onClick={(e) => { e.stopPropagation(); next(); }}
      >
        <FiChevronRight size={28} />
      </button>

      {/* Caption */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm text-center px-4">
        {images[current].alt}
      </p>

      {/* Thumbnail strip */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-2 max-w-lg overflow-x-auto px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
              i === current ? 'border-brand scale-110' : 'border-white/20 opacity-50 hover:opacity-80'
            }`}
          >
            <img src={img.thumb} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Gallery Section ───────────────────────────────────────
export default function ImageGallery({ images = GALLERY_IMAGES }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(null);

  // Auto-advance
  useEffect(() => {
    const t = setInterval(() => {
      setActive((i) => (i + 1) % images.length);
    }, 4500);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <>
      <div className="w-full">
        {/* Main image */}
        <div className="relative group overflow-hidden rounded-2xl aspect-[16/9] bg-slate-200 cursor-pointer shadow-xl"
          onClick={() => setLightbox(active)}
        >
          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={img.alt}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                i === active ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-slate-800 rounded-xl px-5 py-3 flex items-center gap-2 font-semibold text-sm shadow-lg">
              <FiMaximize2 size={16} />
              Ver en pantalla completa
            </div>
          </div>

          {/* Nav arrows */}
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all"
            onClick={(e) => { e.stopPropagation(); setActive((i) => (i - 1 + images.length) % images.length); }}
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all"
            onClick={(e) => { e.stopPropagation(); setActive((i) => (i + 1) % images.length); }}
          >
            <FiChevronRight size={20} />
          </button>

          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-4">
            <p className="text-white text-sm font-medium">{images[active].alt}</p>
          </div>

          {/* Dots */}
          <div className="absolute bottom-10 right-4 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActive(i); }}
                className={`rounded-full transition-all ${
                  i === active ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                i === active
                  ? 'border-brand shadow-md scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100 hover:border-brand/40'
              }`}
            >
              <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox images={images} index={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}
