import { FiAward, FiDroplet, FiUsers, FiClock } from 'react-icons/fi';
import { useReveal } from '../../hooks/useReveal';

// Franja de trayectoria. Estaba copiada carácter por carácter en Landing y About:
// si mañana cambian "+500 piscinas" había que acordarse de editar los dos archivos.
export const TRAYECTORIA_STATS = [
  { Icon: FiAward,   n: '+30 años', l: 'de trayectoria en Villa María' },
  { Icon: FiDroplet, n: '+500',     l: 'piscinas construidas' },
  { Icon: FiUsers,   n: '100%',     l: 'atención personalizada' },
  { Icon: FiClock,   n: '48h',      l: 'para tu presupuesto' },
];

export default function StatsStrip({ stats = TRAYECTORIA_STATS }) {
  const reveal = useReveal();

  return (
    <section ref={reveal.ref} className={reveal.className}
      style={{ background: 'var(--surface-card)', padding: 'var(--space-8) var(--space-5)',
               borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="ps-stats-grid" style={{ maxWidth: 1120, margin: '0 auto' }}>
        {stats.map((s) => (
          <div key={s.l} className="ps-stat-item" style={{ textAlign: 'center', padding: '0 var(--space-5)' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', margin: '0 auto var(--space-3)',
              border: '2px solid var(--brand-accent)', color: 'var(--brand-accent-press)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <s.Icon size={19} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
                          color: 'var(--text-strong)', lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 'var(--space-2)', lineHeight: 1.4 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
