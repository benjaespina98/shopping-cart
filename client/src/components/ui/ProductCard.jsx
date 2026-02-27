import { useState } from 'react';
import { FiShoppingCart, FiPlus, FiMinus, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const inCart = items.find((i) => i.productId === product._id);
  const isOutOfStock = product.stock === 0;
  const isLowStock = !isOutOfStock && product.stock <= 5;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addItem(product, qty);
    setAdded(true);
    toast.success(`"${product.name}" agregado al carrito`);
    setTimeout(() => setAdded(false), 2000);
    setQty(1);
  };

  const currentImg = product.images?.[0]?.url;

  return (
    <div className="card flex flex-col group overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {currentImg ? (
          <img
            src={currentImg}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
            <FiShoppingCart size={32} />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}
        {/* Gradient overlay */}
        {currentImg && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        {product.featured && !isOutOfStock && (
          <span className="absolute top-2.5 left-2.5 badge bg-brand text-white shadow-sm">⭐ Destacado</span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
            <span className="badge bg-white text-slate-700 font-semibold text-sm px-4 py-1.5 shadow">Sin stock</span>
          </div>
        )}
        {inCart && !isOutOfStock && (
          <span className="absolute top-2.5 right-2.5 badge bg-green-500 text-white shadow-sm">✓ En carrito</span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <span className="text-[11px] font-semibold text-brand uppercase tracking-widest bg-brand/5 px-2 py-0.5 rounded-full">
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
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-slate-400 font-medium">$</span>
            <span className="text-2xl font-extrabold text-slate-900 leading-none">
              {product.price.toLocaleString('es-AR')}
            </span>
          </div>

          {/* Low stock warning */}
          {isLowStock && (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
              <FiAlertTriangle size={12} className="shrink-0" />
              <span className="text-xs font-medium">Últimas {product.stock} unidades</span>
            </div>
          )}

          {!isOutOfStock && (
            <div className="flex items-center gap-2">
              {/* Qty selector */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-2 hover:bg-slate-200 transition-colors text-slate-600 active:scale-90"
                >
                  <FiMinus size={12} />
                </button>
                <span className="px-3 text-sm font-bold min-w-[2.5rem] text-center text-slate-800">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-2.5 py-2 hover:bg-slate-200 transition-colors text-slate-600 active:scale-90"
                >
                  <FiPlus size={12} />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAdd}
                disabled={added}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${added
                    ? 'bg-green-500 text-white scale-95'
                    : 'bg-brand text-white hover:bg-brand-dark active:scale-95 shadow-sm hover:shadow-md'
                  }`}
              >
                {added ? <FiCheck size={15} /> : <FiShoppingCart size={15} />}
                {added ? 'Agregado' : 'Agregar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
