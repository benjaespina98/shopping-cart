import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ui/ProductCard';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      const { data } = await productsAPI.getAll(params);
      setProducts(data.products);
      setTotalPages(data.pages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, debouncedSearch]);

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
    setPage(1);
  };

  const hasFilters = search || selectedCategory;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tienda</h1>
        <p className="text-slate-500 mt-1">Explorá todos nuestros productos</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <FiX size={15} />
            </button>
          )}
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="btn-ghost flex items-center gap-1.5 text-sm border border-slate-200">
            <FiX size={14} /> Limpiar filtros
          </button>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              !selectedCategory
                ? 'bg-brand text-white border-brand'
                : 'border-slate-200 text-slate-600 hover:border-brand hover:text-brand bg-white'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand text-white border-brand'
                  : 'border-slate-200 text-slate-600 hover:border-brand hover:text-brand bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-slate-200 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-6 bg-slate-200 rounded w-1/2 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <FiFilter size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No se encontraron productos</p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-primary mt-4">Limpiar filtros</button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost border border-slate-200 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-600">Página {page} de {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost border border-slate-200 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
