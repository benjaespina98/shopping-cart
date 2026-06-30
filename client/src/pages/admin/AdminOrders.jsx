import { useEffect, useState } from 'react';
import { FiShoppingBag, FiCheck, FiX, FiChevronDown, FiChevronUp, FiTrash2, FiUser } from 'react-icons/fi';
import { ordersAPI } from '../../services/api';
import { toast } from 'react-toastify';

const STATUS_LABELS = {
  whatsapp_sent: { label: 'Pendiente',   color: 'bg-primary-50 text-primary-700' },
  confirmed:     { label: 'Confirmado',  color: 'bg-green-50 text-green-700' },
  cancelled:     { label: 'Cancelado',   color: 'bg-red-50 text-red-500' },
};

function OrderRow({ order, onStatusChange, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="px-4 py-3.5">
          <p className="font-semibold text-slate-800 text-sm">
            {order.customerName || <span className="text-slate-400 font-normal italic">Sin nombre</span>}
          </p>
          {order.customerPhone && (
            <a
              href={`tel:${order.customerPhone}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-slate-500 hover:text-primary-700"
            >
              {order.customerPhone}
            </a>
          )}
        </td>
        <td className="px-4 py-3.5 text-xs text-slate-500">
          {new Date(order.createdAt).toLocaleDateString('es-AR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit',
          })}
        </td>
        <td className="px-4 py-3.5 text-sm text-slate-600">
          {order.items.length} ítem{order.items.length !== 1 ? 's' : ''}
        </td>
        <td className="px-4 py-3.5 text-right font-semibold text-slate-800 text-sm">
          ${order.total.toLocaleString('es-AR')}
        </td>
        <td className="px-4 py-3.5 text-center">
          <span className={`badge ${STATUS_LABELS[order.status]?.color}`}>
            {STATUS_LABELS[order.status]?.label || order.status}
          </span>
        </td>
        <td className="px-4 py-3.5">
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {order.status !== 'confirmed' && (
              <button
                onClick={() => onStatusChange(order._id, 'confirmed')}
                title="Marcar como confirmado"
                className="p-2 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-500 transition-colors"
              >
                <FiCheck size={15} />
              </button>
            )}
            {order.status !== 'cancelled' && (
              <button
                onClick={() => onStatusChange(order._id, 'cancelled')}
                title="Cancelar pedido"
                className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
              >
                <FiX size={15} />
              </button>
            )}
            <button
              onClick={() => onDelete(order._id)}
              title="Eliminar pedido"
              className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <FiTrash2 size={14} />
            </button>
            {open ? <FiChevronUp size={14} className="text-slate-400 ml-1" /> : <FiChevronDown size={14} className="text-slate-400 ml-1" />}
          </div>
        </td>
      </tr>
      {open && (
        <tr className="bg-slate-50/60">
          <td colSpan={6} className="px-6 py-4">
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <span className="font-medium text-slate-700 flex-1">{item.name}</span>
                  <span className="text-slate-400 text-xs">x{item.quantity}</span>
                  <span className="text-slate-600 font-semibold">
                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
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
      const params = { limit: 100 };
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
      setOrders((os) => os.map((o) => (o._id === id ? { ...o, status } : o)));
      toast.success(`Pedido ${status === 'confirmed' ? 'confirmado' : 'cancelado'}`);
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) return;
    try {
      await ordersAPI.delete(id);
      setOrders((os) => os.filter((o) => o._id !== id));
      toast.success('Pedido eliminado');
    } catch {
      toast.error('Error al eliminar el pedido');
    }
  };

  const filters = [
    { value: '', label: 'Todos' },
    { value: 'whatsapp_sent', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmados' },
    { value: 'cancelled', label: 'Cancelados' },
  ];

  const pendingCount = orders.filter((o) => o.status === 'whatsapp_sent').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {orders.length} pedido{orders.length !== 1 ? 's' : ''} total
            {pendingCount > 0 && (
              <span className="ml-2 badge bg-amber-50 text-amber-700">{pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
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
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-slate-200 rounded" />)}
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
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5"><FiUser size={13} /> Cliente</span>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Ítems</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Total</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <OrderRow
                    key={o._id}
                    order={o}
                    onStatusChange={handleStatus}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
