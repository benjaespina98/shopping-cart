import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FiSearch, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import ProductDetailModal from '../components/ui/ProductDetailModal';
import { useCart } from '../context/CartContext';
import { Button } from '../design-system/Button';
import { FALLBACK_CATEGORIES } from '../data/fallbackCategories';

const SORT_OPTIONS = [
  { value: '',           label: 'Relevancia' },
  { value: 'price_asc',  label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'name_asc',   label: 'Nombre A → Z' },
];

const pillStyle = (active) => ({
  padding: '8px 16px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
  border: `1.5px solid ${active ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
  background: active ? 'var(--brand-primary)' : 'var(--surface-card)',
  color: active ? 'var(--text-inverse)' : 'var(--text-body)',
  boxShadow: active ? 'var(--shadow-primary)' : 'none',
  transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
});

// Esqueleto de carga. Antes eran bloques planos del color del borde: se veían
// congelados, sin señal de que algo estuviera pasando. Ahora barren con `.skeleton`
// y reproducen la forma real de la tarjeta, así el salto al contenido no se nota.
function ProductSkeleton() {
  return (
    <div style={{
      background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)', overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="skeleton" style={{ aspectRatio: '4 / 3', borderRadius: 0 }} />
      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="skeleton" style={{ height: 10, width: '40%' }} />
        <div className="skeleton" style={{ height: 15, width: '85%' }} />
        <div className="skeleton" style={{ height: 12, width: '65%' }} />
        <div className="skeleton" style={{ height: 26, width: '45%', marginTop: 6 }} />
        <div className="skeleton" style={{ height: 42, width: '100%', marginTop: 4, borderRadius: 12 }} />
      </div>
    </div>
  );
}

export default function Shop() {
  const { items } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const resultsRef = useRef(null);
  const isFirstRender = useRef(true);

  const inCartByProductId = useMemo(() => {
    const map = new Map();
    items.forEach((item) => map.set(item.productId, item.quantity));
    return map;
  }, [items]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    categoriesAPI.getAll()
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) setCategories(data.map((c) => c.name));
      })
      .catch(() => {}); // conserva el respaldo
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 12 };
      if (selectedCategory) params.category = selectedCategory;
      if (debouncedSearch)  params.search   = debouncedSearch;
      if (sort)             params.sort      = sort;
      const { data } = await productsAPI.getAll(params);
      setProducts(data.products);
      setTotalPages(data.pages);
      setTotalProducts(data.total ?? data.products.length);
    } catch {
      setProducts([]);
      setError('No pudimos cargar los productos. Verificá tu conexión e intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, debouncedSearch, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Al pasar de página quedabas viendo el pie de la grilla anterior (donde está la
  // paginación) mientras arriba ya habían cambiado los productos — había que scrollear
  // a mano para darte cuenta. Se salta el primer render para no scrollear al entrar
  // a la tienda desde otra página.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [page]);

  const handleCategory = (cat) => {
    setSelectedCategory(cat === selectedCategory ? '' : cat);
    setPage(1);
  };

  const clearFilters = () => { setSearch(''); setSelectedCategory(''); setSort(''); setPage(1); };

  const hasFilters = search || selectedCategory || sort;

  return (
    <section style={{ background: 'var(--bg-page)', padding: '52px 20px 72px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div className="ps-eyebrow" style={{ marginBottom: 10 }}>Tienda</div>
          <h1 style={{ fontSize: 'clamp(26px, 5vw, 42px)', letterSpacing: '-0.02em', marginBottom: 12,
                       fontFamily: 'var(--font-display)', color: 'var(--text-strong)', overflowWrap: 'break-word' }}>
            Todo para tu piscina
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-body)', lineHeight: 1.6, maxWidth: 520 }}>
            Productos de mantenimiento, limpieza, seguridad y climatización. Retirá en local o coordinamos entrega en Villa María.
          </p>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <button onClick={() => handleCategory('')} style={pillStyle(!selectedCategory)}>Todos</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => handleCategory(cat)} style={pillStyle(selectedCategory === cat)}>
              {cat}
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div ref={resultsRef} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 28,
                      background: '#fff', borderRadius: 'var(--radius-lg)', padding: '12px 16px',
                      border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ flex: '1 1 180px', position: 'relative', minWidth: 0 }}>
            <FiSearch size={14} style={{ position: 'absolute', left: 11, top: '50%',
                                         transform: 'translateY(-50%)', color: 'var(--text-muted)',
                                         pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', paddingLeft: 34, paddingRight: search ? 32 : 12, height: 38,
                       border: '1.5px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
                       fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-body)',
                       background: 'var(--bg-page)', outline: 'none', boxSizing: 'border-box' }}
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }}
                style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)',
                         background: 'none', border: 'none', cursor: 'pointer',
                         color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                <FiX size={13} />
              </button>
            )}
          </div>

          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            style={{ height: 38, padding: '0 10px', border: '1.5px solid var(--border-default)',
                     borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)', fontSize: 14,
                     color: 'var(--text-body)', background: 'var(--bg-page)', cursor: 'pointer', outline: 'none' }}
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {hasFilters && (
            <button onClick={clearFilters}
              style={{ display: 'flex', alignItems: 'center', gap: 4, height: 38, padding: '0 12px',
                       border: '1.5px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
                       background: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                       fontSize: 13, color: 'var(--text-muted)' }}>
              <FiX size={13} /> Limpiar
            </button>
          )}
        </div>

        {/* Result count */}
        {!loading && !error && products.length > 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            {totalProducts} producto{totalProducts !== 1 ? 's' : ''}
            {selectedCategory && (
              <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}> en "{selectedCategory}"</span>
            )}
          </p>
        )}

        {/* Products */}
        {loading ? (
          <div className="ps-products-grid">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', background: '#fff',
                        borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-strong)', marginBottom: 8 }}>
              Hubo un problema al cargar la tienda
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>{error}</p>
            <Button variant="primary" onClick={fetchProducts}>Reintentar</Button>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff',
                        borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-strong)', marginBottom: 8 }}>
              No se encontraron productos
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              Probá con otra categoría o cambiá la búsqueda
            </p>
            {hasFilters && <Button variant="outline" onClick={clearFilters}>Limpiar filtros</Button>}
          </div>
        ) : (
          <>
            <div className="ps-products-grid">
              {products.map((p, i) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  inCartQuantity={inCartByProductId.get(p._id) || 0}
                  onOpenDetail={setDetailProduct}
                  // La primera fila entra en pantalla sin scrollear: cargarla en diferido
                  // sólo hacía que el visitante viera huecos al abrir la tienda.
                  priority={i < 4}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 48 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Página {page} de {totalPages}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, height: 36, padding: '0 12px',
                             border: '1.5px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
                             background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer',
                             fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                             color: page === 1 ? 'var(--text-muted)' : 'var(--text-body)', opacity: page === 1 ? 0.4 : 1 }}
                  >
                    <FiChevronLeft size={14} /> Anterior
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '…' ? (
                        <span key={`d${i}`} style={{ color: 'var(--text-muted)', fontSize: 14, padding: '0 4px' }}>…</span>
                      ) : (
                        <button key={p} onClick={() => setPage(p)}
                          style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                                   border: page === p ? '2px solid var(--brand-primary)' : '1.5px solid var(--border-default)',
                                   background: page === p ? 'var(--brand-primary)' : '#fff',
                                   color: page === p ? '#fff' : 'var(--text-body)',
                                   fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                          {p}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, height: 36, padding: '0 12px',
                             border: '1.5px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
                             background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                             fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                             color: page === totalPages ? 'var(--text-muted)' : 'var(--text-body)',
                             opacity: page === totalPages ? 0.4 : 1 }}
                  >
                    Siguiente <FiChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          inCartQuantity={inCartByProductId.get(detailProduct._id) || 0}
          onClose={() => setDetailProduct(null)}
        />
      )}
    </section>
  );
}
