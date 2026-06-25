import { useState, useEffect, useRef } from 'react';
import {
  FiUpload, FiTrash2, FiEdit2, FiCheck, FiX, FiImage,
  FiArrowUp, FiArrowDown, FiEyeOff, FiEye,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { servicesAPI } from '../../services/api';

const TONES = ['teal', 'sun'];
const VARIANTS = ['soft', 'solid'];

const emptyForm = { title: '', tag: '', description: '', bullets: '', tone: 'teal', variant: 'soft', active: true };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const editFileRef = useRef();

  const load = async () => {
    try {
      const { data } = await servicesAPI.getAllAdmin();
      setServices(data);
    } catch {
      toast.error('No se pudieron cargar los servicios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.tag || !form.description) {
      toast.error('Completá título, etiqueta y descripción.');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('tag', form.tag);
      fd.append('description', form.description);
      fd.append('tone', form.tone);
      fd.append('variant', form.variant);
      fd.append('active', form.active);
      const bulletList = form.bullets.split(',').map((b) => b.trim()).filter(Boolean);
      fd.append('bullets', JSON.stringify(bulletList));
      if (file) fd.append('image', file);
      await servicesAPI.create(fd);
      setForm(emptyForm);
      setFile(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      await load();
      toast.success('Servicio agregado.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear el servicio.');
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (s) => {
    setEditingId(s._id);
    setEditForm({
      title: s.title, tag: s.tag, description: s.description,
      bullets: (s.bullets || []).join(', '), tone: s.tone, variant: s.variant, active: s.active,
    });
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
      fd.append('tag', editForm.tag);
      fd.append('description', editForm.description);
      fd.append('tone', editForm.tone);
      fd.append('variant', editForm.variant);
      fd.append('active', editForm.active);
      const bulletList = editForm.bullets.split(',').map((b) => b.trim()).filter(Boolean);
      fd.append('bullets', JSON.stringify(bulletList));
      if (editFile) fd.append('image', editFile);
      const { data } = await servicesAPI.update(id, fd);
      setServices((prev) => prev.map((s) => (s._id === id ? data : s)));
      cancelEdit();
      toast.success('Servicio actualizado.');
    } catch {
      toast.error('Error al guardar los cambios.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este servicio? Dejará de mostrarse en la web.')) return;
    try {
      await servicesAPI.delete(id);
      setServices((prev) => prev.filter((s) => s._id !== id));
      toast.success('Servicio eliminado.');
    } catch {
      toast.error('Error al eliminar el servicio.');
    }
  };

  const toggleActive = async (s) => {
    try {
      const fd = new FormData();
      fd.append('active', String(!s.active));
      const { data } = await servicesAPI.update(s._id, fd);
      setServices((prev) => prev.map((p) => (p._id === s._id ? data : p)));
      toast.success(data.active ? 'Servicio visible en la web' : 'Servicio oculto de la web');
    } catch {
      toast.error('Error al actualizar el servicio.');
    }
  };

  const handleMove = async (index, dir) => {
    const next = [...services];
    const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[index], next[swapIdx]] = [next[swapIdx], next[index]];
    const updated = next.map((s, i) => ({ ...s, order: i }));
    setServices(updated);
    try {
      await servicesAPI.reorder(updated.map(({ _id, order }) => ({ id: _id, order })));
    } catch {
      toast.error('Error al reordenar.');
      await load();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Sitio web — Servicios</h1>
        <p className="text-slate-500 text-sm mt-1">
          Editá los textos, viñetas y la foto de cada servicio que se muestra en <strong>/servicios</strong> y en la portada.
          Usá las flechas ↑↓ para ordenarlos y el ícono de ojo para ocultar uno sin borrarlo.
        </p>
      </div>

      {/* Create form */}
      <div className="card p-6 mb-8">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FiUpload size={16} className="text-primary-700" />
          Agregar servicio
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex gap-4 items-start flex-wrap">
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
                <input className="input" placeholder="Piscinas de obra" value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="label">Etiqueta *</label>
                <input className="input" placeholder="Construcción" value={form.tag}
                  onChange={(e) => setForm(f => ({ ...f, tag: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Descripción *</label>
                <textarea className="input resize-none" rows={2} placeholder="Descripción del servicio..." value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Viñetas (separadas por coma)</label>
                <input className="input" placeholder="Estudio y diseño 3D, Hormigón gunitado" value={form.bullets}
                  onChange={(e) => setForm(f => ({ ...f, bullets: e.target.value }))} />
              </div>
              <div>
                <label className="label">Color de acento</label>
                <select className="input" value={form.tone} onChange={(e) => setForm(f => ({ ...f, tone: e.target.value }))}>
                  {TONES.map(t => <option key={t} value={t}>{t === 'teal' ? 'Teal' : 'Sol (amarillo)'}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Estilo de etiqueta</label>
                <select className="input" value={form.variant} onChange={(e) => setForm(f => ({ ...f, variant: e.target.value }))}>
                  {VARIANTS.map(v => <option key={v} value={v}>{v === 'soft' ? 'Suave' : 'Sólido'}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={uploading} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? 'Guardando...' : 'Agregar servicio'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card animate-pulse h-32" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FiImage size={40} className="mx-auto mb-3 opacity-40" />
          <p>Todavía no cargaste ningún servicio.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {services.map((s, index) => (
            <div key={s._id} className={`card p-4 ${!s.active ? 'opacity-60' : ''}`}>
              {editingId === s._id ? (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-4 items-start flex-wrap">
                    <label className="flex-shrink-0 cursor-pointer">
                      <div className="w-28 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary-700 flex items-center justify-center text-slate-400 hover:text-primary-700 transition-colors overflow-hidden text-xs">
                        {editPreview
                          ? <img src={editPreview} alt="" className="w-full h-full object-cover" />
                          : s.imageUrl
                            ? <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                            : <span>Cambiar foto</span>}
                      </div>
                      <input type="file" accept="image/*" className="hidden" ref={editFileRef} onChange={handleEditFileChange} />
                    </label>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input className="input text-sm" value={editForm.title} placeholder="Título"
                        onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} />
                      <input className="input text-sm" value={editForm.tag} placeholder="Etiqueta"
                        onChange={(e) => setEditForm(f => ({ ...f, tag: e.target.value }))} />
                      <textarea className="input text-sm resize-none sm:col-span-2" rows={2} value={editForm.description} placeholder="Descripción"
                        onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} />
                      <input className="input text-sm sm:col-span-2" value={editForm.bullets} placeholder="Viñetas separadas por coma"
                        onChange={(e) => setEditForm(f => ({ ...f, bullets: e.target.value }))} />
                      <select className="input text-sm" value={editForm.tone}
                        onChange={(e) => setEditForm(f => ({ ...f, tone: e.target.value }))}>
                        {TONES.map(t => <option key={t} value={t}>{t === 'teal' ? 'Teal' : 'Sol (amarillo)'}</option>)}
                      </select>
                      <select className="input text-sm" value={editForm.variant}
                        onChange={(e) => setEditForm(f => ({ ...f, variant: e.target.value }))}>
                        {VARIANTS.map(v => <option key={v} value={v}>{v === 'soft' ? 'Suave' : 'Sólido'}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(s._id)} className="btn-primary btn-sm flex items-center gap-1">
                      <FiCheck size={14} /> Guardar
                    </button>
                    <button onClick={cancelEdit} className="btn-ghost btn-sm flex items-center gap-1">
                      <FiX size={14} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    {s.imageUrl
                      ? <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-slate-300"><FiImage size={20} /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: s.tone === 'sun' ? '#FFF4D2' : '#DEEBEF', color: s.tone === 'sun' ? '#946A0B' : '#244B5A' }}>
                        {s.tag}
                      </span>
                      {!s.active && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Oculto</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                    {s.bullets?.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1">{s.bullets.join(' · ')}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 items-end">
                    <div className="flex gap-1">
                      <button onClick={() => handleMove(index, -1)} disabled={index === 0} title="Subir"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors">
                        <FiArrowUp size={14} />
                      </button>
                      <button onClick={() => handleMove(index, 1)} disabled={index === services.length - 1} title="Bajar"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors">
                        <FiArrowDown size={14} />
                      </button>
                      <button onClick={() => toggleActive(s)} title={s.active ? 'Ocultar de la web' : 'Mostrar en la web'}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                        {s.active ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                      </button>
                      <button onClick={() => handleDelete(s._id)} title="Eliminar"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    <button onClick={() => startEdit(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:border-primary-700 hover:text-primary-700 hover:bg-primary-50 transition-colors">
                      <FiEdit2 size={13} /> Editar texto y foto
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
