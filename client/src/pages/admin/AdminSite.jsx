import { useState, useEffect, useRef } from 'react';
import {
  FiUpload, FiTrash2, FiEdit2, FiCheck, FiX, FiImage,
  FiStar, FiArrowUp, FiArrowDown,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { projectsAPI } from '../../services/api';

const CATEGORIES = ['Obra nueva', 'Reformas', 'Comunidades', 'Spa'];

const emptyForm = { title: '', location: '', category: 'Obra nueva', featured: false };

export default function AdminSite() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Upload / create form
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const editFileRef = useRef();

  const load = async () => {
    try {
      const { data } = await projectsAPI.getAll();
      setProjects(data);
    } catch {
      toast.error('No se pudieron cargar los proyectos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Create ──────────────────────────────────────────────

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.location) {
      toast.error('Completá título y localidad.');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('location', form.location);
      fd.append('category', form.category);
      fd.append('featured', form.featured);
      if (file) fd.append('image', file);
      await projectsAPI.create(fd);
      setForm(emptyForm);
      setFile(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      await load();
      toast.success('Proyecto agregado.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear el proyecto.');
    } finally {
      setUploading(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────

  const startEdit = (p) => {
    setEditingId(p._id);
    setEditForm({ title: p.title, location: p.location, category: p.category, featured: p.featured });
    setEditFile(null);
    setEditPreview(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFile(null);
    setEditPreview(null);
  };

  const handleEditFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setEditFile(f);
    setEditPreview(URL.createObjectURL(f));
  };

  const saveEdit = async (id) => {
    try {
      const fd = new FormData();
      fd.append('title', editForm.title);
      fd.append('location', editForm.location);
      fd.append('category', editForm.category);
      fd.append('featured', editForm.featured);
      if (editFile) fd.append('image', editFile);
      const { data } = await projectsAPI.update(id, fd);
      setProjects((prev) => prev.map((p) => (p._id === id ? data : p)));
      cancelEdit();
      toast.success('Proyecto actualizado.');
    } catch {
      toast.error('Error al guardar los cambios.');
    }
  };

  // ── Delete ──────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este proyecto?')) return;
    try {
      await projectsAPI.delete(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success('Proyecto eliminado.');
    } catch {
      toast.error('Error al eliminar el proyecto.');
    }
  };

  // ── Reorder ─────────────────────────────────────────────

  const handleMove = async (index, dir) => {
    const next = [...projects];
    const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[index], next[swapIdx]] = [next[swapIdx], next[index]];
    const updated = next.map((p, i) => ({ ...p, order: i }));
    setProjects(updated);
    try {
      await projectsAPI.reorder(updated.map(({ _id, order }) => ({ id: _id, order })));
    } catch {
      toast.error('Error al reordenar.');
      await load();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Sitio web — Proyectos</h1>
        <p className="text-slate-500 text-sm mt-1">
          Cargá y organizá los proyectos que aparecen en <strong>/proyectos</strong> y en el grid de la home (los marcados como destacados).
        </p>
      </div>

      {/* Upload form */}
      <div className="card p-6 mb-8">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FiUpload size={16} className="text-primary-700" />
          Agregar proyecto
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex gap-4 items-start flex-wrap">
            {/* Image picker */}
            <label className="flex-shrink-0 cursor-pointer">
              <div className="w-36 h-28 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary-700 flex flex-col items-center justify-center text-slate-400 hover:text-primary-700 transition-colors overflow-hidden">
                {preview
                  ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  : <><FiImage size={24} /><span className="text-xs mt-1">Elegir foto</span></>}
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleFileChange} />
            </label>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Título *</label>
                <input className="input" placeholder="Piscina infinity" value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="label">Localidad *</label>
                <input className="input" placeholder="Villa Nueva" value={form.location}
                  onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <label className="label">Categoría</label>
                <select className="input" value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={form.featured}
                    onChange={(e) => setForm(f => ({ ...f, featured: e.target.checked }))}
                    className="w-4 h-4 accent-primary-700" />
                  <FiStar size={14} className="text-amber-500" />
                  Destacar en la home
                </label>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={uploading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? 'Subiendo...' : 'Agregar proyecto'}
            </button>
          </div>
        </form>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-56" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FiImage size={40} className="mx-auto mb-3 opacity-40" />
          <p>Todavía no cargaste ningún proyecto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, index) => (
            <div key={p._id} className="card overflow-hidden">
              {/* Image */}
              <div className="aspect-video relative bg-slate-100">
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-slate-300"><FiImage size={32} /></div>}
                {p.featured && (
                  <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FiStar size={10} /> Home
                  </span>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => handleMove(index, -1)} disabled={index === 0}
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-600 disabled:opacity-30 shadow-sm">
                    <FiArrowUp size={14} />
                  </button>
                  <button onClick={() => handleMove(index, 1)} disabled={index === projects.length - 1}
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-600 disabled:opacity-30 shadow-sm">
                    <FiArrowDown size={14} />
                  </button>
                </div>
              </div>

              {/* Info / edit */}
              <div className="p-3">
                {editingId === p._id ? (
                  <div className="flex flex-col gap-2">
                    {/* New image in edit */}
                    <label className="cursor-pointer">
                      <div className="w-full h-20 rounded-lg border-2 border-dashed border-slate-300 hover:border-primary-700 flex items-center justify-center text-slate-400 hover:text-primary-700 transition-colors overflow-hidden text-xs">
                        {editPreview
                          ? <img src={editPreview} alt="" className="w-full h-full object-cover" />
                          : <span>Cambiar imagen (opcional)</span>}
                      </div>
                      <input type="file" accept="image/*" className="hidden" ref={editFileRef} onChange={handleEditFileChange} />
                    </label>
                    <input className="input text-sm" value={editForm.title}
                      onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="Título" />
                    <input className="input text-sm" value={editForm.location}
                      onChange={(e) => setEditForm(f => ({ ...f, location: e.target.value }))} placeholder="Localidad" />
                    <select className="input text-sm" value={editForm.category}
                      onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={editForm.featured}
                        onChange={(e) => setEditForm(f => ({ ...f, featured: e.target.checked }))}
                        className="w-4 h-4 accent-primary-700" />
                      Destacar en la home
                    </label>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(p._id)} className="btn-primary btn-sm flex items-center gap-1">
                        <FiCheck size={14} /> Guardar
                      </button>
                      <button onClick={cancelEdit} className="btn-ghost btn-sm flex items-center gap-1">
                        <FiX size={14} /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.title}</p>
                      <p className="text-xs text-slate-500">{p.location} · {p.category}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-700">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
