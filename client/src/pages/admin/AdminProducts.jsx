import { useEffect, useId, useMemo, useState, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiCheck, FiAlertCircle, FiSave, FiSearch, FiPackage, FiTag } from 'react-icons/fi';
import { productsAPI, categoriesAPI } from '../../services/api';
import CategoryManager from '../../components/admin/CategoryManager';
import CldImage from '../../components/ui/CldImage';
import { FALLBACK_CATEGORIES } from '../../data/fallbackCategories';
import { toast } from 'react-toastify';

const SORT_OPTIONS = [
  { value: 'recent',     label: 'Más recientes' },
  { value: 'name_asc',   label: 'Nombre A → Z' },
  { value: 'name_desc',  label: 'Nombre Z → A' },
  { value: 'price_asc',  label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'stock_asc',  label: 'Menos stock' },
];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  featured: false,
  active: true,
  tags: '',
};

function ProductModal({ product, categories, onClose, onSaved }) {
  // Incluye siempre la categoría actual del producto aunque ya no exista en la lista
  const categoryOptions = Array.from(
    new Set([...(categories || []), product?.category].filter(Boolean))
  );
  // Los <label> de este form eran texto suelto sin htmlFor/id: se leían visualmente pero un
  // lector de pantalla (o un test que consulta por label, como corresponde) no podía asociarlos
  // con su input. useId() da un prefijo único aunque el modal se monte varias veces.
  const uid = useId();
  const fieldId = (name) => `${uid}-${name}`;
  const [form, setForm] = useState(
    product
      ? { ...product, tags: product.tags?.join(', ') || '', featured: product.featured, active: product.active }
      : EMPTY_FORM
  );
  const [newFiles, setNewFiles] = useState([]);
  const [removeIds, setRemoveIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    setNewFiles([...newFiles, ...Array.from(e.target.files || [])]);
  };

  const removeNewFile = (i) => setNewFiles(newFiles.filter((_, idx) => idx !== i));
  const toggleRemoveImage = (publicId) => {
    setRemoveIds((ids) =>
      ids.includes(publicId) ? ids.filter((id) => id !== publicId) : [...ids, publicId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('stock', form.stock);
      fd.append('category', form.category);
      fd.append('featured', String(form.featured));
      fd.append('active', String(form.active));

      const tagList = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagList.length > 0) {
        fd.append('tags', JSON.stringify(tagList));
      }

      newFiles.forEach((f) => fd.append('images', f));
      if (removeIds.length) fd.append('removeImages', JSON.stringify(removeIds));

      if (product) {
        await productsAPI.update(product._id, fd);
        toast.success('Producto actualizado');
      } else {
        await productsAPI.create(fd);
        toast.success('Producto creado');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ps-scrim">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-lg">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label" htmlFor={fieldId('name')}>Nombre *</label>
              <input id={fieldId('name')} className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Nombre del producto" />
            </div>
            <div>
              <label className="label" htmlFor={fieldId('price')}>Precio *</label>
              <input id={fieldId('price')} type="number" min="0" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="0.00" />
            </div>
            <div>
              <label className="label" htmlFor={fieldId('stock')}>Stock *</label>
              <input id={fieldId('stock')} type="number" min="0" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="label" htmlFor={fieldId('category')}>Categoría *</label>
              <select id={fieldId('category')} className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Seleccionar categoría...</option>
                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {categoryOptions.length === 0 && (
                <p className="text-xs text-slate-400 mt-1">No hay categorías cargadas. Creá una en la sección Categorías.</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="label" htmlFor={fieldId('description')}>Descripción</label>
              <textarea id={fieldId('description')} className="input resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción del producto..." />
            </div>
            <div className="col-span-2">
              <label className="label" htmlFor={fieldId('tags')}>Tags (separados por coma)</label>
              <input id={fieldId('tags')} className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="oferta, nuevo, destacado" />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            {[['featured', 'Destacado'], ['active', 'Activo']].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setForm({ ...form, [key]: !form[key] })}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${form[key] ? 'bg-brand' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </label>
            ))}
          </div>

          {/* Existing images */}
          {product?.images?.length > 0 && (
            <div>
              {/* No es el label de un único input — es el título de la grilla de miniaturas
                  de abajo, cada una con su propio botón de "quitar" — por eso <p>, no <label>. */}
              <p className="label">Imágenes actuales</p>
              <div className="flex flex-wrap gap-2">
                {product.images.map((img) => (
                  <div key={img.publicId} className="relative w-20 h-20">
                    <CldImage src={img.url} width={160} className={`w-full h-full object-cover rounded-xl border-2 transition-all ${removeIds.includes(img.publicId) ? 'opacity-40 border-red-400' : 'border-slate-200'}`} />
                    <button type="button" onClick={() => toggleRemoveImage(img.publicId)}
                      className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white flex items-center justify-center text-xs transition-colors ${removeIds.includes(img.publicId) ? 'bg-green-500' : 'bg-red-500'}`}>
                      {removeIds.includes(img.publicId) ? <FiCheck size={10} /> : <FiX size={10} />}
                    </button>
                  </div>
                ))}
              </div>
              {removeIds.length > 0 && <p className="text-xs text-red-500 mt-1">{removeIds.length} imagen(es) marcadas para eliminar</p>}
            </div>
          )}

          {/* New images */}
          <div>
            <label className="label" htmlFor="product-new-images">Agregar imágenes</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-brand hover:bg-brand-light/10 transition-colors"
            >
              <FiUpload size={20} className="mx-auto text-slate-400 mb-1" />
              <p className="text-sm text-slate-500">Click para subir imágenes</p>
              <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WEBP — máx. 5 archivos</p>
            </div>
            <input id="product-new-images" ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
            {newFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newFiles.map((f, i) => (
                  <div key={i} className="relative w-20 h-20 bg-slate-100 rounded-xl overflow-hidden">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewFile(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center">
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Guardando...' : product ? 'Actualizar' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]); // [{_id, name}]
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | product
  const [deleting, setDeleting] = useState(null);
  const [editingStockId, setEditingStockId] = useState(null);
  const [draftStocks, setDraftStocks] = useState({});
  const [savingStockId, setSavingStockId] = useState(null);

  // Vista y filtros
  const [tab, setTab] = useState('products'); // 'products' | 'categories'
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('recent');

  const categoryNames = useMemo(
    () => (categoriesData.length > 0 ? categoriesData.map((c) => c.name) : FALLBACK_CATEGORIES),
    [categoriesData]
  );

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await productsAPI.getAllAdmin({ limit: 100 });
      setProducts(data.products);
    } catch {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const { data } = await categoriesAPI.getAll();
      if (Array.isArray(data)) setCategoriesData(data);
    } catch {
      // conserva el respaldo (categoryNames cae en FALLBACK_CATEGORIES)
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  // Filtro + búsqueda + orden (en el back office, sobre los productos ya cargados)
  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    });
    const by = {
      name_asc:   (a, b) => a.name.localeCompare(b.name),
      name_desc:  (a, b) => b.name.localeCompare(a.name),
      price_asc:  (a, b) => a.price - b.price,
      price_desc: (a, b) => b.price - a.price,
      stock_asc:  (a, b) => a.stock - b.stock,
      recent:     (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    }[sort];
    return by ? [...list].sort(by) : list;
  }, [products, search, categoryFilter, sort]);

  const hasFilters = search || categoryFilter || sort !== 'recent';
  const clearFilters = () => { setSearch(''); setCategoryFilter(''); setSort('recent'); };

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(product._id);
    try {
      await productsAPI.delete(product._id);
      toast.success('Producto eliminado');
      fetchProducts();
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeleting(null);
    }
  };

  const beginStockEdit = (product) => {
    setEditingStockId(product._id);
    setDraftStocks((prev) => ({ ...prev, [product._id]: String(product.stock) }));
  };

  const cancelStockEdit = () => {
    setEditingStockId(null);
  };

  const saveStock = async (product) => {
    const raw = draftStocks[product._id];
    const val = Number(raw);
    if (!Number.isFinite(val) || val < 0) {
      toast.error('Ingresá un stock válido (0 o mayor)');
      return;
    }

    if (val === product.stock) {
      setEditingStockId(null);
      return;
    }

    try {
      setSavingStockId(product._id);
      await productsAPI.updateStock(product._id, val);
      setProducts((ps) => ps.map((p) => p._id === product._id ? { ...p, stock: val } : p));
      toast.success('Stock actualizado');
      setEditingStockId(null);
    } catch {
      toast.error('Error al actualizar stock');
    } finally {
      setSavingStockId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {products.length} producto{products.length !== 1 ? 's' : ''} · {categoryNames.length} categoría{categoryNames.length !== 1 ? 's' : ''}
          </p>
        </div>
        {tab === 'products' && (
          <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
            <FiPlus size={17} /> Nuevo producto
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {[
          { id: 'products', label: 'Productos', Icon: FiPackage },
          { id: 'categories', label: 'Categorías', Icon: FiTag },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === id ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'categories' && (
        <CategoryManager
          categories={categoriesData}
          loading={categoriesLoading}
          onChanged={() => { fetchCategories(); fetchProducts(); }}
        />
      )}

      {tab === 'products' && (
        <>
          {/* Toolbar: búsqueda + categoría + orden */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[180px]">
              <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, categoría o descripción..."
                className="input pl-9"
              />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input w-auto">
              <option value="">Todas las categorías</option>
              {categoryNames.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input w-auto">
              {SORT_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-ghost btn-sm flex items-center gap-1 text-slate-500">
                <FiX size={14} /> Limpiar
              </button>
            )}
          </div>

          {loading ? (
            <div className="card p-6 animate-pulse space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-slate-200 rounded" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="card p-12 text-center">
              <FiAlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No hay productos</p>
              <button onClick={() => setModal('create')} className="btn-primary mt-4 inline-flex items-center gap-2">
                <FiPlus size={15} /> Crear primer producto
              </button>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="card p-12 text-center">
              <FiSearch size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">Sin resultados</p>
              <p className="text-slate-400 text-sm mt-1">Probá con otra búsqueda o cambiá la categoría.</p>
              <button onClick={clearFilters} className="btn-secondary mt-4 inline-flex items-center gap-2">
                <FiX size={15} /> Limpiar filtros
              </button>
            </div>
          ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 w-12">Img</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Categoría</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Precio</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Stock</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((p) => (
                  <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {p.images?.[0]?.url ? (
                          <CldImage src={p.images[0].url} alt={p.name} width={80} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">N/A</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 line-clamp-1">{p.name}</p>
                      {p.featured && <span className="badge bg-brand-light text-brand text-xs">Destacado</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.category}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">${p.price.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3 text-center">
                      {editingStockId === p._id ? (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={draftStocks[p._id] ?? ''}
                            onChange={(e) =>
                              setDraftStocks((prev) => ({ ...prev, [p._id]: e.target.value }))
                            }
                            className="w-20 text-center border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                          />
                          <button
                            onClick={() => saveStock(p)}
                            disabled={savingStockId === p._id}
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                            title="Guardar stock"
                          >
                            <FiSave size={14} />
                          </button>
                          <button
                            onClick={cancelStockEdit}
                            className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            title="Cancelar edición"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span className="inline-flex min-w-10 justify-center rounded-lg border border-slate-200 px-2 py-1 text-sm font-medium text-slate-700">
                            {p.stock}
                          </span>
                          <button
                            onClick={() => beginStockEdit(p)}
                            className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            title="Editar stock"
                            aria-label={`Editar stock de ${p.name}`}
                          >
                            <FiEdit2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${p.active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {p.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModal(p)}
                          className="p-2 rounded-lg hover:bg-brand-light text-slate-500 hover:text-brand transition-colors"
                          title="Editar producto"
                          aria-label={`Editar ${p.name}`}
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deleting === p._id}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Eliminar producto"
                          aria-label={`Eliminar ${p.name}`}
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          )}
        </>
      )}

      {/* Modal */}
      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          categories={categoryNames}
          onClose={() => setModal(null)}
          onSaved={fetchProducts}
        />
      )}
    </div>
  );
}
