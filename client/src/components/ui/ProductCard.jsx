import { memo, useEffect, useRef, useState } from 'react';
import { FiShoppingCart, FiPlus, FiMinus, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

function ProductCard({ product, inCartQuantity = 0 }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const addedTimeoutRef = useRef(null);

  const isOutOfStock = product.stock === 0;
  const isLowStock = !isOutOfStock && product.stock <= 5;
  const remainingStock = Math.max(0, product.stock - inCartQuantity);
  const maxSelectableQty = Math.max(1, remainingStock);
  const hasReachedCartStockLimit = !isOutOfStock && remainingStock === 0;

  useEffect(() => {
    setQty((currentQty) => Math.min(currentQty, maxSelectableQty));
  }, [maxSelectableQty]);

  useEffect(() => {
    return () => {
      if (addedTimeoutRef.current) {
        clearTimeout(addedTimeoutRef.current);
      }
    };
  }, []);

  const handleAdd = () => {
    if (isOutOfStock || hasReachedCartStockLimit) return;
    addItem(product, qty);
    setAdded(true);
    toast.success(`"${product.name}" agregado al carrito`);
    if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    addedTimeoutRef.current = setTimeout(() => setAdded(false), 2000);
    setQty(1);
  };

  const currentImg = product.images?.[0]?.url;
  const safePrice = Number(product.price) || 0;
  const selectedTotalPrice = safePrice * qty;

  return (
    <div className="card flex flex-col group overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {currentImg ? (
          <img
            src={currentImg}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!imgLoaded ? 'shimmer' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 shimmer-soft">
            <FiShoppingCart size={32} />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}
        {/* Gradient overlay */}
        {currentImg && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        {product.featured && !isOutOfStock && (
          <span className="absolute top-2.5 left-2.5 badge bg-primary-700 text-white shadow-sm">⭐ Destacado</span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className="badge bg-white text-slate-800 font-extrabold text-sm px-5 py-2 shadow-xl">Sin stock</span>
          </div>
        )}
        {inCartQuantity > 0 && !isOutOfStock && (
          <span className="absolute top-2.5 right-2.5 badge bg-green-500 text-white shadow-sm">✓ En carrito</span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <span className="text-[11px] font-semibold text-primary-700 uppercase tracking-widest bg-primary-700/5 px-2 py-0.5 rounded-full">
            {product.category}
          </span>
          <h3 className="font-semibold text-slate-800 mt-2 line-clamp-2 leading-snug text-sm">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
          )}
        </div>

        <div className="border-t border-slate-100 pt-3 space-y-3">
          {/* Price */}
          <div className="space-y-2 bg-primary-50 -mx-4 -mb-3 px-4 py-3 rounded-b-lg">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-primary-600 font-bold">$</span>
              <span className="text-3xl font-extrabold text-primary-700 leading-none">
                {safePrice.toLocaleString('es-AR')}
              </span>
              <span className="text-xs text-primary-600 font-medium">c/u</span>
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              Total:{' '}
              <span className="font-bold text-primary-700">
                ${selectedTotalPrice.toLocaleString('es-AR')}
              </span>
            </p>
          </div>

          {/* Low stock warning */}
          {isLowStock && (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
              <FiAlertTriangle size={12} className="shrink-0" />
              <span className="text-xs font-medium">Últimas {product.stock} unidades</span>
            </div>
          )}

          {!isOutOfStock && (
            <div className="flex items-center gap-3">
              {/* Qty selector */}
              <div className="flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden bg-slate-50 transition-colors focus-within:border-primary-700/40 focus-within:ring-4 focus-within:ring-primary-700/10">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="px-3 py-2.5 hover:bg-slate-200 transition-colors text-slate-600 active:scale-90 disabled:opacity-30 flex items-center justify-center outline-none"
                  aria-label="Reducir cantidad"
                >
                  <FiMinus size={14} />
                </button>
                <span className="px-3 text-base font-bold min-w-[2.5rem] text-center text-slate-800 tabular-nums">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(maxSelectableQty, q + 1))}
                  disabled={qty >= maxSelectableQty}
                  className="px-3 py-2.5 hover:bg-slate-200 transition-colors text-slate-600 active:scale-90 disabled:opacity-30 flex items-center justify-center outline-none"
                  aria-label="Aumentar cantidad"
                >
                  <FiPlus size={14} />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAdd}
                disabled={added || hasReachedCartStockLimit}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all duration-300
                  ${added
                    ? 'bg-green-500 text-white scale-[0.98]'
                    : hasReachedCartStockLimit
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-primary-700 text-white hover:bg-primary-800 active:scale-[0.98] shadow-md shadow-primary hover:shadow-lg focus-visible:ring-4 focus-visible:ring-primary-700/30'
                  }`}
              >
                {added ? (
                  <>
                    <FiCheck size={18} />
                    <span>¡Agregado!</span>
                  </>
                ) : hasReachedCartStockLimit ? (
                  <span>Límite de stock</span>
                ) : (
                  <>
                    <FiShoppingCart size={18} />
                    <span>Agregar</span>
                  </>
                )}
              </button>
            </div>
          )}
          {!isOutOfStock && (
            <p className="text-[11px] text-slate-400">
              {hasReachedCartStockLimit
                ? 'Ya agregaste todo el stock disponible de este producto.'
                : `Disponibles para sumar: ${remainingStock}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
