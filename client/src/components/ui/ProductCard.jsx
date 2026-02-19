import { useState } from 'react';
import { FiShoppingCart, FiPlus, FiMinus, FiCheck } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const inCart = items.find((i) => i.productId === product._id);
  const isOutOfStock = product.stock === 0;

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
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {currentImg ? (
          <img
            src={currentImg}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">
            Sin imagen
          </div>
        )}
        {product.featured && !isOutOfStock && (
          <span className="absolute top-2 left-2 badge bg-brand text-white">Destacado</span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="badge bg-white text-slate-700 font-semibold text-sm px-3 py-1">Sin stock</span>
          </div>
        )}
        {inCart && !isOutOfStock && (
          <span className="absolute top-2 right-2 badge bg-green-500 text-white">En carrito</span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <span className="text-xs font-medium text-brand uppercase tracking-wide">{product.category}</span>
          <h3 className="font-semibold text-slate-800 mt-0.5 line-clamp-2 leading-snug">{product.name}</h3>
          {product.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
          )}
        </div>

        <div className="mt-auto pt-2">
          <p className="text-xl font-bold text-slate-900">
            ${product.price.toLocaleString('es-AR')}
          </p>

          {!isOutOfStock && (
            <div className="flex items-center gap-2 mt-3">
              {/* Qty selector */}
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-2 py-1.5 hover:bg-slate-100 transition-colors text-slate-600"
                >
                  <FiMinus size={13} />
                </button>
                <span className="px-3 text-sm font-medium min-w-[2rem] text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-2 py-1.5 hover:bg-slate-100 transition-colors text-slate-600"
                >
                  <FiPlus size={13} />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAdd}
                disabled={added}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                  ${added
                    ? 'bg-green-500 text-white'
                    : 'bg-brand text-white hover:bg-brand-dark active:scale-95'
                  }`}
              >
                {added ? <FiCheck size={15} /> : <FiShoppingCart size={15} />}
                {added ? 'Agregado' : 'Agregar'}
              </button>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-2">Stock: {product.stock} unidades</p>
        </div>
      </div>
    </div>
  );
}
