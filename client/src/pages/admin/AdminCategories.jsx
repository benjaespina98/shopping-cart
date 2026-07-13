import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiTag, FiAlertCircle } from 'react-icons/fi';
import { categoriesAPI } from '../../services/api';
import { toast } from 'react-toastify';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await categoriesAPI.getAll();
      setCategories(data);
    } catch {
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await categoriesAPI.create({ name });
      toast.success('Categoría creada');
      setNewName('');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear');
    } finally {
      setCreating(false);
    }
  };

  const beginEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async (cat) => {
    const name = editName.trim();
    if (!name) return;
    if (name === cat.name) { cancelEdit(); return; }
    setSavingId(cat._id);
    try {
      await categoriesAPI.update(cat._id, { name });
      toast.success('Categoría actualizada. Los productos se reasignaron automáticamente.');
      cancelEdit();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;
    setDeletingId(cat._id);
    try {
      await categoriesAPI.delete(cat._id);
      toast.success('Categoría eliminada');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorías</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {categories.length} categoría{categories.length !== 1 ? 's' : ''} · se usan en la tienda y en el alta de productos
          </p>
        </div>
      </div>

      {/* Alta rápida */}
      <form onSubmit={handleCreate} className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          className="input flex-1"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva categoría (ej. Bombas y filtros)"
          maxLength={60}
        />
        <button type="submit" disabled={creating || !newName.trim()} className="btn-primary flex items-center justify-center gap-2 sm:w-auto">
          <FiPlus size={17} /> {creating ? 'Agregando...' : 'Agregar'}
        </button>
      </form>

      {/* Lista */}
      {loading ? (
        <div className="card p-6 animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-11 bg-slate-200 rounded" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center">
          <FiAlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No hay categorías todavía</p>
          <p className="text-slate-400 text-sm mt-1">Agregá la primera con el campo de arriba.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <ul>
            {categories.map((cat) => (
              <li key={cat._id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-brand-light/40 text-brand flex items-center justify-center shrink-0">
                  <FiTag size={16} />
                </div>

                {editingId === cat._id ? (
                  <>
                    <input
                      className="input flex-1"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={60}
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(cat); if (e.key === 'Escape') cancelEdit(); }}
                    />
                    <button onClick={() => saveEdit(cat)} disabled={savingId === cat._id}
                      className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50" title="Guardar">
                      <FiCheck size={16} />
                    </button>
                    <button onClick={cancelEdit}
                      className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors" title="Cancelar">
                      <FiX size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-slate-800">{cat.name}</span>
                    <button onClick={() => beginEdit(cat)}
                      className="p-2 rounded-lg hover:bg-brand-light text-slate-500 hover:text-brand transition-colors" title="Renombrar">
                      <FiEdit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(cat)} disabled={deletingId === cat._id}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors disabled:opacity-50" title="Eliminar">
                      <FiTrash2 size={15} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
