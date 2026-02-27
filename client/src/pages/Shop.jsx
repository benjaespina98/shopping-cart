import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ui/ProductCard';

const SORT_OPTIONS = [
  { value: '',          label: 'Relevancia' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc','label': 'Precio: mayor a menor' },
  { value: 'name_asc',  label: 'Nombre: A → Z' },
];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (selectedCategory) params.category = selectedCategory;
      if (debouncedSearch) params.search = debouncedSearch;
      if (sort) params.sort = sort;
      const { data } = await productsAPI.getAll(params);
      setProducts(data.products);
      setTotalPages(data.pages);
      setTotalProducts(data.total ?? data.products.length);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, debouncedSearch, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    productsAPI.getCategories().then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat === selectedCategory ? '' : cat);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSort('');
    setPage(1);
  };

  const hasFilters = search || selectedCategory || sort;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <span className="section-eyebrow">Catálogo</span>
        <h1 className="section-title">Tienda</h1>
        <p className="text-slate-500 mt-1">Explorá todos nuestros productos para piscinas</p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-10"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <FiX size={15} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="input max-w-[220px] cursor-pointer"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {hasFilters && (
          <button onClick={clearFilters} className="btn-ghost flex items-center gap-1.5 text-sm border border-slate-200 shrink-0">
            <FiX size={14} /> Limpiar filtros
          </button>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
              !selectedCategory
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'border-slate-200 text-slate-600 hover:border-brand hover:text-brand bg-white'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                selectedCategory === cat
                  ? 'bg-brand text-white border-brand shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:border-brand hover:text-brand bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Result count */}
      {!loading && products.length > 0 && (
        <p className="text-sm text-slate-400 mb-5">
          {totalProducts > 0
            ? `Mostrando ${products.length} de ${totalProducts} producto${totalProducts !== 1 ? 's' : ''}`
            : `${products.length} producto${products.length !== 1 ? 's' : ''}`}
          {selectedCategory && <span className="text-brand font-medium"> en "{selectedCategory}"</span>}
        </p>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] bg-slate-200 rounded-t-2xl" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-slate-200 rounded-full w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
                <div className="h-7 bg-slate-200 rounded w-1/2 mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
          <FiFilter size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-700 font-semibold text-lg">No se encontraron productos</p>
          <p className="text-slate-400 text-sm mt-1 mb-5">Probá ajustando los filtros o la búsqueda</p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-primary">Limpiar filtros</button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 btn-ghost border border-slate-200 disabled:opacity-30 px-3"
              >
                <FiChevronLeft size={16} /> Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`dots-${i}`} className="px-2 text-slate-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                          page === p
                            ? 'bg-brand text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 btn-ghost border border-slate-200 disabled:opacity-30 px-3"
              >
                Siguiente <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}