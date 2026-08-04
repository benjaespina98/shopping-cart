import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// En archivo aparte y cargado con React.lazy: recharts pesa ~105 kB comprimido y es lo
// único que lo usa. Si viviera dentro de AdminDashboard, cada login tendría que bajarlo
// antes de poder ver un solo número.
export default function OrdersChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F2" />
        <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
        <Tooltip
          formatter={(v, n) => [v, n === 'confirmedOrders' ? 'Confirmados' : 'Total']}
          labelFormatter={(l) => `Fecha: ${l}`}
        />
        <Bar dataKey="count" fill="#BCD6DD" radius={[3, 3, 0, 0]} name="count" />
        <Bar dataKey="confirmedOrders" fill="#244B5A" radius={[3, 3, 0, 0]} name="confirmedOrders" />
      </BarChart>
    </ResponsiveContainer>
  );
}
