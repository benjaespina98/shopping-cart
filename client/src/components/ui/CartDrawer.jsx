import { useEffect, useState } from 'react';
import { FiX, FiTrash2, FiPlus, FiMinus, FiMessageCircle, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import CldImage from './CldImage';
import { ordersAPI } from '../../services/api';
import { toast } from 'react-toastify';

export default function CartDrawer() {
  const { items, removeItem, updateQty, clearCart, totalItems, totalPrice, isOpen, toggleCart } =
    useCart();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') toggleCart();
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, toggleCart]);

  const handleWhatsApp = async () => {
    if (items.length === 0) return;

    const popup = window.open('', '_blank');
    setSending(true);
    try {
      const { data } = await ordersAPI.create({
        items: items.map(({ productId, quantity }) => ({ productId, quantity })),
      });

      if (popup && !popup.closed) {
        popup.location.href = data.whatsappUrl;
      } else {
        window.location.href = data.whatsappUrl;
      }

      clearCart();
      toggleCart();
      toast.success('¡Pedido enviado a WhatsApp!');
    } catch (err) {
      if (popup && !popup.closed) popup.close();
      toast.error(err.response?.data?.message || 'Error al procesar el pedido');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {/* El velo era negro puro; sobre el teal petróleo del sitio ensuciaba el color.
          En tono de marca se lee como profundidad y no como una capa gris encima. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-standard"
          style={{ background: 'rgba(18, 43, 51, 0.48)' }}
          onClick={toggleCart}
        />
      )}

      {/* Drawer.
          Queda siempre montado para poder animar la entrada y la salida, pero cuando
          está cerrado hay que sacarlo de la navegación: si no, tabulando desde la
          tienda el foco se iba a botones invisibles fuera de pantalla, y los lectores
          de pantalla anunciaban un carrito que no está a la vista. */}
      <div
        role="dialog"
        aria-modal={isOpen}
        aria-label="Carrito de compras"
        aria-hidden={!isOpen}
        inert={isOpen ? undefined : ''}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-xl
          transition-transform duration-slow ease-out-brand
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FiShoppingCart size={20} className="text-primary-700" />
            <h2 className="font-semibold text-slate-800 text-lg">
              Carrito
              {totalItems > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-500">({totalItems} items)</span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
              >
                Vaciar
              </button>
            )}
            <button
              onClick={toggleCart}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
              <FiShoppingCart size={48} strokeWidth={1} />
              <p className="font-medium">Tu carrito está vacío</p>
              <p className="text-sm text-center">Agregá productos desde la tienda para comenzar</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-3 items-start">
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <CldImage
                    src={item.image}
                    alt={item.name}
                    width={128}
                    className="w-full h-full object-cover"
                    fallback={
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                        N/A
                      </div>
                    }
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">{item.name}</p>
                  <p className="text-sm text-primary-700 font-semibold mt-0.5">
                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                  </p>
                  <p className="text-xs text-slate-400">${item.price.toLocaleString('es-AR')} c/u</p>
                  <p className="text-[11px] text-slate-400">Stock disponible: {item.stock}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden text-sm">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-2 py-1 hover:bg-slate-100 transition-colors text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FiMinus size={11} />
                      </button>
                      <span className="px-2 min-w-[1.8rem] text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="px-2 py-1 hover:bg-slate-100 transition-colors text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FiPlus size={11} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Total</span>
              <span className="text-xl font-bold text-slate-900">
                ${totalPrice.toLocaleString('es-AR')}
              </span>
            </div>
            {/* Tenía un shimmer permanente encima: un CTA que titila solo distrae y
                da impresión de que algo está cargando. La jerarquía la da el color. */}
            <button
              onClick={handleWhatsApp}
              disabled={sending}
              className="w-full flex flex-col items-center justify-center gap-1 bg-success-500 hover:bg-success-600 text-white font-display font-semibold py-3.5 rounded-md shadow-success hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm disabled:opacity-60 disabled:pointer-events-none text-base transition-all duration-standard ease-out-brand"
            >
              <span className="flex items-center gap-2.5">
                <FiMessageCircle size={19} />
                {sending ? 'Procesando...' : 'Finalizar compra'}
              </span>
              <span className="text-xs font-normal opacity-85">Por WhatsApp · sin recargo</span>
            </button>
            <p className="text-xs text-center text-neutral-500">
              Se abrirá WhatsApp con tu pedido cargado
            </p>
          </div>
        )}
      </div>
    </>
  );
}
