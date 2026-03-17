import { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiRefreshCw, FiActivity } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { logsAPI } from '../../services/api';

const ENTITY_OPTIONS = ['', 'auth', 'product', 'order', 'settings', 'user'];
const ACTION_OPTIONS = [
  '',
  'LOGIN_SUCCESS',
  'PASSWORD_CHANGED',
  'PRODUCT_CREATED',
  'PRODUCT_UPDATED',
  'PRODUCT_STOCK_UPDATED',
  'PRODUCT_DELETED',
  'ORDER_CREATED',
  'ORDER_STATUS_UPDATED',
  'SETTINGS_UPDATED',
  'ADMIN_USER_CREATED',
  'ADMIN_USER_DELETED',
];

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
};

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [action, entity, debouncedSearch]);

  const queryParams = useMemo(() => {
    const params = { page, limit: 25 };
    if (action) params.action = action;
    if (entity) params.entity = entity;
    if (debouncedSearch) params.search = debouncedSearch;
    return params;
  }, [page, action, entity, debouncedSearch]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data } = await logsAPI.getAll(queryParams);
      setLogs(data.logs || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudieron cargar los logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [queryParams]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Logs del sistema</h1>
        <p className="text-sm text-slate-500">Auditoria de acciones en panel admin y eventos relevantes.</p>
      </div>

      <div className="card p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px_auto] gap-3">
          <div className="relative">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Buscar por mensaje, actor o ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="input" value={entity} onChange={(e) => setEntity(e.target.value)}>
            {ENTITY_OPTIONS.map((value) => (
              <option key={value || 'all-entities'} value={value}>
                {value ? `Entidad: ${value}` : 'Todas las entidades'}
              </option>
            ))}
          </select>

          <select className="input" value={action} onChange={(e) => setAction(e.target.value)}>
            {ACTION_OPTIONS.map((value) => (
              <option key={value || 'all-actions'} value={value}>
                {value || 'Todas las acciones'}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn-secondary inline-flex items-center justify-center gap-2"
            onClick={loadLogs}
            disabled={loading}
          >
            <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Recargar
          </button>
        </div>

        <p className="text-xs text-slate-400">{total} registro(s) encontrados</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
            <FiActivity size={28} />
            <p>No hay logs para los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold">Accion</th>
                  <th className="text-left px-4 py-3 font-semibold">Entidad</th>
                  <th className="text-left px-4 py-3 font-semibold">Mensaje</th>
                  <th className="text-left px-4 py-3 font-semibold">Actor</th>
                  <th className="text-left px-4 py-3 font-semibold">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{log.entity}</td>
                    <td className="px-4 py-3 min-w-[260px] text-slate-700">{log.message || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {log.actor?.email || log.actor?.name || 'Sistema'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{log.request?.ip || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="btn-ghost border border-slate-200"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            Anterior
          </button>
          <span className="text-sm text-slate-500">Página {page} de {pages}</span>
          <button
            type="button"
            className="btn-ghost border border-slate-200"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages || loading}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
