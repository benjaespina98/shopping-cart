import { useState, useEffect, useRef } from 'react';
import {
  FiUpload, FiTrash2, FiArrowUp, FiArrowDown,
  FiEdit2, FiCheck, FiX, FiImage,
} from 'react-icons/fi';
import { galleryAPI } from '../../services/api';

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Upload form
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [altInput, setAltInput] = useState('');
  const fileRef = useRef();

  // Inline edit alt
  const [editingId, setEditingId] = useState(null);
  const [editAlt, setEditAlt] = useState('');

  const load = async () => {
    try {
      const { data } = await galleryAPI.getAll();
      setImages(data);
    } catch {
      setError('No se pudieron cargar las imágenes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const notify = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('alt', altInput || 'Imagen de galería');
      await galleryAPI.add(fd);
      setFile(null);
      setPreview(null);
      setAltInput('');
      if (fileRef.current) fileRef.current.value = '';
      await load();
      notify('Imagen subida correctamente.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta imagen de la galería?')) return;
    try {
      await galleryAPI.delete(id);
      setImages((prev) => prev.filter((img) => img._id !== id));
      notify('Imagen eliminada.');
    } catch {
      setError('Error al eliminar la imagen.');
    }
  };

  const handleMove = async (index, dir) => {
    const newImages = [...images];
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= newImages.length) return;
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    const updated = newImages.map((img, i) => ({ ...img, order: i }));
    setImages(updated);
    try {
      await galleryAPI.reorder(updated.map(({ _id, order }) => ({ id: _id, order })));
    } catch {
      setError('Error al guardar el nuevo orden.');
      await load();
    }
  };

  const startEdit = (img) => {
    setEditingId(img._id);
    setEditAlt(img.alt);
  };

  const saveEdit = async (id) => {
    try {
      const { data } = await galleryAPI.update(id, { alt: editAlt });
      setImages((prev) => prev.map((img) => (img._id === id ? data : img)));
      setEditingId(null);
      notify('Descripción actualizada.');
    } catch {
      setError('Error al actualizar la descripción.');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Galería</h1>
        <p className="text-slate-500 text-sm mt-1">
          Administrá las fotos que aparecen en el carrusel del inicio.
        </p>
      </div>

      {/* Upload card */}
      <div className="card p-6 mb-8">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FiUpload size={16} className="text-brand" />
          Subir nueva imagen
        </h2>
        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-start">
          {/* File picker */}
          <label className="flex-shrink-0 cursor-pointer">
            <div className="w-32 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-brand flex flex-col items-center justify-center text-slate-400 hover:text-brand transition-colors overflow-hidden">
              {preview
                ? <img src={preview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                : <><FiImage size={24} /><span className="text-xs mt-1">Elegir foto</span></>
              }
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileRef}
              onChange={handleFileChange}
            />
          </label>

          <div className="flex-1 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Descripción (alt text)"
              value={altInput}
              onChange={(e) => setAltInput(e.target.value)}
              className="input"
            />
            <button
              type="submit"
              disabled={!file || uploading}
              className="btn-primary self-start disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Subiendo...' : 'Subir imagen'}
            </button>
          </div>
        </form>
      </div>

      {/* Feedback */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <FiCheck size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Images grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FiImage size={40} className="mx-auto mb-3 opacity-40" />
          <p>No hay imágenes en la galería todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, index) => (
            <div key={img._id} className="card overflow-hidden group">
              {/* Image */}
              <div className="aspect-video relative">
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    title="Mover arriba"
                    className="p-2 rounded-lg bg-white/90 hover:bg-white text-slate-700 disabled:opacity-30 transition"
                  >
                    <FiArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMove(index, 1)}
                    disabled={index === images.length - 1}
                    title="Mover abajo"
                    className="p-2 rounded-lg bg-white/90 hover:bg-white text-slate-700 disabled:opacity-30 transition"
                  >
                    <FiArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(img._id)}
                    title="Eliminar"
                    className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
                {/* Order badge */}
                <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  #{index + 1}
                </span>
              </div>

              {/* Alt text */}
              <div className="p-3 flex items-center gap-2">
                {editingId === img._id ? (
                  <>
                    <input
                      autoFocus
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(img._id)}
                      className="input text-sm flex-1"
                    />
                    <button onClick={() => saveEdit(img._id)} className="text-green-600 hover:text-green-700">
                      <FiCheck size={16} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600">
                      <FiX size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-600 flex-1 truncate">{img.alt}</p>
                    <button onClick={() => startEdit(img)} className="text-slate-400 hover:text-brand flex-shrink-0">
                      <FiEdit2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
