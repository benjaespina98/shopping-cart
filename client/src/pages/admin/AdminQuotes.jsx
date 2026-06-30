import { useEffect, useState } from 'react';
import { FiMail, FiCheck, FiPhone, FiMapPin, FiTag } from 'react-icons/fi';
import { quotesAPI } from '../../services/api';
import { toast } from 'react-toastify';

const STATUS_LABELS = {
  new: { label: 'Nueva', color: 'bg-primary-50 text-primary-700' },
  contacted: { label: 'Contactado', color: 'bg-amber-50 text-amber-700' },
  closed: { label: 'Cerrada', color: 'bg-green-50 text-green-700' },
};

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await quotesAPI.getAll();
      setQuotes(data);
    } catch {
      toast.error('Error al cargar las solicitudes de presupuesto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await quotesAPI.updateStatus(id, status);
      setQuotes((qs) => qs.map((q) => (q._id === id ? { ...q, status } : q)));
    } catch {
      toast.error('Error al actualizar el estado.');
    }
  };

  const filters = [
    { value: '', label: 'Todas' },
    { value: 'new', label: 'Nuevas' },
    { value: 'contacted', label: 'Contactadas' },
    { value: 'closed', label: 'Cerradas' },
  ];

  const filtered = statusFilter ? quotes.filter((q) => q.status === statusFilter) : quotes;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Presupuestos</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Solicitudes recibidas desde <strong>/presupuesto</strong>. {quotes.filter((q) => q.status === 'new').length} sin contactar.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === value
                ? 'bg-brand text-white border-brand'
                : 'border-slate-200 bg-white text-slate-600 hover:border-brand hover:text-brand'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-6 animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-slate-200 rounded" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FiMail size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No hay solicitudes {statusFilter ? 'con este estado' : 'todavía'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((q) => (
            <div key={q._id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-semibold text-slate-800">{q.name}</span>
                    <span className={`badge ${STATUS_LABELS[q.status]?.color}`}>
                      {STATUS_LABELS[q.status]?.label || q.status}
                    </span>
                    {!q.emailSent && (
                      <span className="badge bg-slate-100 text-slate-500" title="El email de notificación no se pudo enviar (SMTP sin configurar)">
                        Sin email
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><FiTag size={13} /> {q.projectType}</span>
                    <a href={`tel:${q.phone}`} className="flex items-center gap-1.5 hover:text-primary-700"><FiPhone size={13} /> {q.phone}</a>
                    <a href={`mailto:${q.email}`} className="flex items-center gap-1.5 hover:text-primary-700"><FiMail size={13} /> {q.email}</a>
                    {q.location && <span className="flex items-center gap-1.5"><FiMapPin size={13} /> {q.location}</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {new Date(q.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {q.status !== 'contacted' && (
                    <button onClick={() => handleStatus(q._id, 'contacted')} title="Marcar como contactado"
                      className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                      <FiPhone size={15} />
                    </button>
                  )}
                  {q.status !== 'closed' && (
                    <button onClick={() => handleStatus(q._id, 'closed')} title="Marcar como cerrada"
                      className="p-2 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-500 transition-colors">
                      <FiCheck size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
