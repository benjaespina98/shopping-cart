import { memo, useEffect, useRef, useState } from 'react';
import { FiShoppingCart, FiPlus, FiMinus, FiCheck, FiAlertTriangle, FiImage } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import CldImage from './CldImage';
import { toast } from 'react-toastify';

// Anchos reales de la tarjeta en la grilla (1 / 2 / 3 columnas) — pedir más que esto
// era lo que hacía que la foto tardara en aparecer.
const CARD_SRCSET_WIDTHS = [320, 480, 640];
const CARD_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px';

function ProductCard({ product, inCartQuantity = 0, onOpenDetail, priority = false }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addedTimeoutRef = useRef(null);

  const isOutOfStock = product.stock === 0;
  const isLowStock = !isOutOfStock && product.stock <= 5;
  const remainingStock = Math.max(0, product.stock - inCartQuantity);
  const maxSelectableQty = Math.max(1, remainingStock);
  const hasReachedCartStockLimit = !isOutOfStock && remainingStock === 0;

  useEffect(() => {
    setQty((currentQty) => Math.min(currentQty, maxSelectableQty));
  }, [maxSelectableQty]);

  useEffect(() => () => {
    if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
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
  const openDetail = () => onOpenDetail?.(product);

  const stepperButton = {
    width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-body)',
    transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
  };

  return (
    <article
      className="ps-product-card"
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* ── Foto ─────────────────────────────────────────── */}
      <div
        className="ps-product-card__media"
        style={{
          position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden',
          background: 'var(--surface-sunken)',
          cursor: onOpenDetail ? 'pointer' : 'default',
        }}
        onClick={onOpenDetail ? openDetail : undefined}
        role={onOpenDetail ? 'button' : undefined}
        tabIndex={onOpenDetail ? 0 : undefined}
        onKeyDown={onOpenDetail ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(); }
        } : undefined}
        aria-label={onOpenDetail ? `Ver detalle de ${product.name}` : undefined}
      >
        <CldImage
          src={currentImg}
          alt={product.name}
          width={640}
          sizes={CARD_SIZES}
          srcSetWidths={CARD_SRCSET_WIDTHS}
          priority={priority}
          className="ps-product-card__img"
          imgStyle={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          fallback={
            <div style={{
              width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              color: 'var(--text-faint)', background: 'var(--surface-sunken)',
            }}>
              <FiImage size={30} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>Sin imagen</span>
            </div>
          }
        />

        {/* Velo que aparece al pasar el mouse, para que la foto se sienta interactiva */}
        {onOpenDetail && (
          <div className="ps-product-card__veil" style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(180deg, rgba(18,43,51,0) 45%, rgba(18,43,51,0.55) 100%)',
            opacity: 0, transition: 'opacity var(--duration-normal) var(--ease-out)',
          }} />
        )}

        {/* Etiquetas de estado. Van arriba, separadas de los datos comerciales. */}
        <div style={{
          position: 'absolute', top: 10, left: 10, right: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          gap: 8, pointerEvents: 'none',
        }}>
          <span>
            {product.featured && !isOutOfStock && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                background: 'var(--brand-accent)', color: 'var(--text-on-accent)',
                fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                boxShadow: 'var(--shadow-sm)',
              }}>
                Destacado
              </span>
            )}
          </span>
          {inCartQuantity > 0 && !isOutOfStock && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 'var(--radius-pill)',
              background: 'var(--surface-card)', color: 'var(--green-500)',
              fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
              boxShadow: 'var(--shadow-sm)', whiteSpace: 'nowrap',
            }}>
              <FiCheck size={11} /> En carrito
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(18,43,51,0.62)', backdropFilter: 'blur(2px)',
          }}>
            <span style={{
              padding: '8px 20px', borderRadius: 'var(--radius-pill)',
              background: 'var(--surface-card)', color: 'var(--text-strong)',
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
              letterSpacing: '0.02em', boxShadow: 'var(--shadow-lg)',
            }}>
              Sin stock
            </span>
          </div>
        )}
      </div>

      {/* ── Datos ────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
        <div
          style={{ flex: 1, cursor: onOpenDetail ? 'pointer' : 'default' }}
          onClick={onOpenDetail ? openDetail : undefined}
        >
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            {product.category}
          </span>

          <h3 className="ps-product-card__title" style={{
            margin: '6px 0 0',
            fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, lineHeight: 1.3,
            color: 'var(--text-strong)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            transition: 'color var(--duration-fast) var(--ease-out)',
          }}>
            {product.name}
          </h3>

          {product.description && (
            <p style={{
              margin: '6px 0 0', fontSize: 13, lineHeight: 1.55, color: 'var(--text-muted)',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {product.description}
            </p>
          )}
        </div>

        {/* Precio — el dato que el visitante busca primero, con el mayor peso visual */}
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          gap: 8, flexWrap: 'wrap',
          paddingTop: 'var(--space-3)', borderTop: '1px solid var(--divider)',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, lineHeight: 1,
            color: 'var(--text-strong)', letterSpacing: '-0.02em',
          }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', marginRight: 2 }}>$</span>
            {safePrice.toLocaleString('es-AR')}
          </span>
          {qty > 1 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Total: <strong style={{ color: 'var(--text-body)' }}>${selectedTotalPrice.toLocaleString('es-AR')}</strong>
            </span>
          )}
        </div>

        {isLowStock && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 10px', borderRadius: 'var(--radius-sm)',
            background: 'var(--amber-100)', color: 'var(--amber-500)',
            fontSize: 12, fontWeight: 600,
          }}>
            <FiAlertTriangle size={12} style={{ flexShrink: 0 }} />
            Últimas {product.stock} unidades
          </div>
        )}

        {!isOutOfStock && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Selector de cantidad */}
              <div className="ps-stepper" style={{
                display: 'flex', alignItems: 'center', flexShrink: 0,
                border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
                background: 'var(--surface-sunken)', overflow: 'hidden',
                transition: 'border-color var(--duration-fast) var(--ease-out)',
              }}>
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  style={{ ...stepperButton, opacity: qty <= 1 ? 0.3 : 1, cursor: qty <= 1 ? 'not-allowed' : 'pointer' }}
                  aria-label="Reducir cantidad"
                >
                  <FiMinus size={14} />
                </button>
                <span style={{
                  minWidth: 30, textAlign: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                  color: 'var(--text-strong)', fontVariantNumeric: 'tabular-nums',
                }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(maxSelectableQty, q + 1))}
                  disabled={qty >= maxSelectableQty}
                  style={{ ...stepperButton, opacity: qty >= maxSelectableQty ? 0.3 : 1, cursor: qty >= maxSelectableQty ? 'not-allowed' : 'pointer' }}
                  aria-label="Aumentar cantidad"
                >
                  <FiPlus size={14} />
                </button>
              </div>

              {/* Acción principal — amarillo sol, como todos los CTA del sitio */}
              <button
                onClick={handleAdd}
                disabled={added || hasReachedCartStockLimit}
                className="ps-add-btn"
                style={{
                  flex: 1, minWidth: 0, minHeight: 42,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '0 14px', borderRadius: 'var(--radius-md)', border: 'none',
                  fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
                  cursor: added || hasReachedCartStockLimit ? 'default' : 'pointer',
                  background: added
                    ? 'var(--green-500)'
                    : hasReachedCartStockLimit ? 'var(--grey-100)' : 'var(--brand-accent)',
                  color: added
                    ? 'var(--text-inverse)'
                    : hasReachedCartStockLimit ? 'var(--text-faint)' : 'var(--text-on-accent)',
                  boxShadow: added || hasReachedCartStockLimit ? 'none' : 'var(--shadow-accent)',
                  transition: 'background var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
                }}
              >
                {added ? (
                  <><FiCheck size={16} /> ¡Agregado!</>
                ) : hasReachedCartStockLimit ? (
                  'Límite de stock'
                ) : (
                  <><FiShoppingCart size={16} /> Agregar</>
                )}
              </button>
            </div>

            <p style={{ fontSize: 11, color: 'var(--text-faint)', margin: 0 }}>
              {hasReachedCartStockLimit
                ? 'Ya agregaste todo el stock disponible de este producto.'
                : `Disponibles para sumar: ${remainingStock}`}
            </p>
          </>
        )}
      </div>
    </article>
  );
}

export default memo(ProductCard);
