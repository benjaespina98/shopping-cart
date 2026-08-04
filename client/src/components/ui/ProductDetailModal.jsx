import { useEffect, useRef, useState } from 'react';
import { FiX, FiShoppingCart, FiPlus, FiMinus, FiCheck, FiAlertTriangle, FiImage } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import CldImage from './CldImage';
import { cldOptimized } from '../../utils/cloudinary';
import { toast } from 'react-toastify';

export default function ProductDetailModal({ product, inCartQuantity = 0, onClose }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const addedTimeoutRef = useRef(null);

  const isOutOfStock = product.stock === 0;
  const isLowStock = !isOutOfStock && product.stock <= 5;
  const remainingStock = Math.max(0, product.stock - inCartQuantity);
  const maxSelectableQty = Math.max(1, remainingStock);
  const hasReachedCartStockLimit = !isOutOfStock && remainingStock === 0;

  const images = product.images?.length ? product.images : [];
  const safePrice = Number(product.price) || 0;
  const selectedTotalPrice = safePrice * qty;

  // Bloquea el scroll del fondo y cierra con Escape mientras el modal está abierto
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    };
  }, [onClose]);

  const handleAdd = () => {
    if (isOutOfStock || hasReachedCartStockLimit) return;
    addItem(product, qty);
    setAdded(true);
    toast.success(`"${product.name}" agregado al carrito`);
    if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    addedTimeoutRef.current = setTimeout(() => setAdded(false), 2000);
    setQty(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ps-scrim"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <span className="text-[11px] font-semibold text-primary-700 uppercase tracking-widest bg-primary-700/5 px-2.5 py-1 rounded-full">
            {product.category}
          </span>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors" aria-label="Cerrar">
            <FiX size={18} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Galería */}
          <div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
              <CldImage
                src={images[activeImg]?.url}
                alt={product.name}
                width={800}
                priority
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                    <FiImage size={36} />
                    <span className="text-xs">Sin imagen</span>
                  </div>
                }
              />
              {isOutOfStock && (
                <div className="absolute inset-0 ps-scrim flex items-center justify-center backdrop-blur-[2px]">
                  <span className="badge bg-white text-slate-800 text-sm px-5 py-2 shadow-lg">Sin stock</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={img.publicId || i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-primary-700' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <img src={cldOptimized(img.url, 160)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{product.name}</h2>

            {/* Mismo tratamiento del precio que en la tarjeta: cifra en el teal más
                oscuro y el símbolo en gris, para que el número sea lo que pesa. */}
            <div className="flex items-baseline gap-1 mt-3 font-display">
              <span className="text-lg text-neutral-500 font-semibold">$</span>
              <span className="text-4xl font-bold text-primary-900 leading-none tracking-tight">
                {safePrice.toLocaleString('es-AR')}
              </span>
              <span className="text-sm text-neutral-500 font-medium">c/u</span>
            </div>

            {/* Estado de stock */}
            <div className="mt-3">
              {isOutOfStock ? (
                <span className="badge bg-slate-100 text-slate-500">Sin stock</span>
              ) : isLowStock ? (
                <div className="inline-flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                  <FiAlertTriangle size={12} className="shrink-0" />
                  <span className="text-xs font-medium">Últimas {product.stock} unidades</span>
                </div>
              ) : (
                <span className="text-xs text-slate-500">Stock disponible: {product.stock} unidades</span>
              )}
            </div>

            {/* Descripción completa */}
            {product.description ? (
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Descripción</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400 italic">Este producto todavía no tiene descripción.</p>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {product.tags.map((t) => (
                  <span key={t} className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">#{t}</span>
                ))}
              </div>
            )}

            {/* Compra */}
            {!isOutOfStock && (
              <div className="mt-auto pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border-2 border-slate-200 rounded-md overflow-hidden bg-slate-50">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      className="px-3 py-2.5 hover:bg-slate-200 transition-colors text-slate-600 active:scale-90 disabled:opacity-30 flex items-center justify-center"
                      aria-label="Reducir cantidad"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="px-3 text-base font-bold min-w-[2.5rem] text-center text-slate-800 tabular-nums">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(maxSelectableQty, q + 1))}
                      disabled={qty >= maxSelectableQty}
                      className="px-3 py-2.5 hover:bg-slate-200 transition-colors text-slate-600 active:scale-90 disabled:opacity-30 flex items-center justify-center"
                      aria-label="Aumentar cantidad"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    disabled={added || hasReachedCartStockLimit}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-semibold transition-all duration-300
                      ${added
                        ? 'bg-green-500 text-white scale-[0.98]'
                        : hasReachedCartStockLimit
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-primary-700 text-white hover:bg-primary-800 active:scale-[0.98] shadow-md shadow-primary hover:shadow-lg'
                      }`}
                  >
                    {added ? (
                      <><FiCheck size={18} /><span>¡Agregado!</span></>
                    ) : hasReachedCartStockLimit ? (
                      <span>Límite de stock</span>
                    ) : (
                      <><FiShoppingCart size={18} /><span>Agregar al carrito</span></>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {hasReachedCartStockLimit
                    ? 'Ya agregaste todo el stock disponible de este producto.'
                    : `Disponibles para sumar: ${remainingStock}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
