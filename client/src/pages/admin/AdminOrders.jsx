import { useEffect, useState } from 'react';
import { FiShoppingBag, FiCheck, FiX, FiMessageCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { ordersAPI } from '../../services/api';
import { toast } from 'react-toastify';

const STATUS_LABELS = {
  whatsapp_sent: { label: 'Enviado WA', color: 'bg-blue-50 text-blue-700' },
  confirmed: { label: 'Confirmado', color: 'bg-green-50 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-50 text-red-500' },
};

function OrderRow({ order, onStatusChange }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <td className="px-4 py-3">
          <p className="font-mono text-xs text-slate-500">{order._id.slice(-8)}</p>
        </td>
        <td className="px-4 py-3 text-sm text-slate-600">
          {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </td>
        <td className="px-4 py-3 text-sm text-slate-600">{order.items.length} producto(s)</td>
        <td className="px-4 py-3 text-right font-semibold text-slate-800">
          ${order.total.toLocaleString('es-AR')}
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`badge ${STATUS_LABELS[order.status]?.color}`}>
            {STATUS_LABELS[order.status]?.label || order.status}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {order.status !== 'confirmed' && (
              <button onClick={() => onStatusChange(order._id, 'confirmed')}
                title="Confirmar"
                className="p-2 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-500 transition-colors">
                <FiCheck size={15} />
              </button>
            )}
            {order.status !== 'cancelled' && (
              <button onClick={() => onStatusChange(order._id, 'cancelled')}
                title="Cancelar"
                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                <FiX size={15} />
              </button>
            )}
            {open ? <FiChevronUp size={15} className="text-slate-400" /> : <FiChevronDown size={15} className="text-slate-400" />}
          </div>
        </td>
      </tr>
      {open && (
        <tr className="bg-slate-50/70">
          <td colSpan={6} className="px-6 py-4">
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />}
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="text-slate-400">x{item.quantity}</span>
                  <span className="ml-auto text-slate-600 font-semibold">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                </div>
              ))}
              {order.whatsappMessage && (
                <details className="mt-2">
                  <summary className="text-xs text-slate-400 cursor-pointer flex items-center gap-1">
                    <FiMessageCircle size={12} /> Ver mensaje WhatsApp
                  </summary>
                  <pre className="text-xs text-slate-500 bg-white border border-slate-200 rounded-lg p-3 mt-1 whitespace-pre-wrap font-sans">
                    {order.whatsappMessage}
                  </pre>
                </details>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await ordersAPI.getAll(params);
      setOrders(data.orders);
    } catch {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const handleStatus = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status);
      setOrders((os) => os.map((o) => o._id === id ? { ...o, status } : o));
      toast.success(`Pedido ${status === 'confirmed' ? 'confirmado' : 'cancelado'}`);
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const filters = [
    { value: '', label: 'Todos' },
    { value: 'whatsapp_sent', label: 'Enviados WA' },
    { value: 'confirmed', label: 'Confirmados' },
    { value: 'cancelled', label: 'Cancelados' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
          <p className="text-slate-500 text-sm mt-0.5">{orders.length} pedidos</p>
        </div>
      </div>

      {/* Filters */}
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
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-slate-200 rounded" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <FiShoppingBag size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No hay pedidos {statusFilter ? 'con este estado' : ''}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Productos</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Total</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <OrderRow key={o._id} order={o} onStatusChange={handleStatus} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
