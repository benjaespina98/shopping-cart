import { useEffect, useState, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { productsAPI } from '../../services/api';
import { toast } from 'react-toastify';

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

function ProductModal({ product, onClose, onSaved }) {
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
      Object.entries(form).forEach(([k, v]) => {
        if (!['images'].includes(k)) fd.append(k, v);
      });
      fd.set('featured', String(form.featured));
      fd.set('active', String(form.active));
      if (form.tags) fd.set('tags', JSON.stringify(form.tags.split(',').map((t) => t.trim()).filter(Boolean)));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
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
              <label className="label">Nombre *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Nombre del producto" />
            </div>
            <div>
              <label className="label">Precio *</label>
              <input type="number" min="0" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="0.00" />
            </div>
            <div>
              <label className="label">Stock *</label>
              <input type="number" min="0" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="label">Categoría *</label>
              <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required placeholder="Ej: Electrónica, Ropa, etc." />
            </div>
            <div className="col-span-2">
              <label className="label">Descripción</label>
              <textarea className="input resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción del producto..." />
            </div>
            <div className="col-span-2">
              <label className="label">Tags (separados por coma)</label>
              <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="oferta, nuevo, destacado" />
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
              <label className="label">Imágenes actuales</label>
              <div className="flex flex-wrap gap-2">
                {product.images.map((img) => (
                  <div key={img.publicId} className="relative w-20 h-20">
                    <img src={img.url} alt="" className={`w-full h-full object-cover rounded-xl border-2 transition-all ${removeIds.includes(img.publicId) ? 'opacity-40 border-red-400' : 'border-slate-200'}`} />
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
            <label className="label">Agregar imágenes</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-brand hover:bg-brand-light/10 transition-colors"
            >
              <FiUpload size={20} className="mx-auto text-slate-400 mb-1" />
              <p className="text-sm text-slate-500">Click para subir imágenes</p>
              <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WEBP — máx. 5 archivos</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
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
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | product
  const [deleting, setDeleting] = useState(null);

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

  useEffect(() => { fetchProducts(); }, []);

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

  const handleStockChange = async (product, newStock) => {
    const val = Number(newStock);
    if (isNaN(val) || val < 0) return;
    try {
      await productsAPI.updateStock(product._id, val);
      setProducts((ps) => ps.map((p) => p._id === product._id ? { ...p, stock: val } : p));
    } catch {
      toast.error('Error al actualizar stock');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-slate-500 text-sm mt-0.5">{products.length} productos en total</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2">
          <FiPlus size={17} /> Nuevo producto
        </button>
      </div>

      {/* Table */}
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
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
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
                      <input
                        type="number"
                        min="0"
                        value={p.stock}
                        onChange={(e) => handleStockChange(p, e.target.value)}
                        className="w-16 text-center border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${p.active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {p.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setModal(p)} className="p-2 rounded-lg hover:bg-brand-light text-slate-500 hover:text-brand transition-colors">
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deleting === p._id}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors disabled:opacity-50"
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

      {/* Modal */}
      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchProducts}
        />
      )}
    </div>
  );
}
