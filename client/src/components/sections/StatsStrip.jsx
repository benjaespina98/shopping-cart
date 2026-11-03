import { FiAward, FiDroplet, FiLayers, FiClock } from 'react-icons/fi';
import { useReveal } from '../../hooks/useReveal';

// Franja de trayectoria. Estaba copiada carácter por carácter en Landing y About:
// si mañana cambian "+500 piscinas" había que acordarse de editar los dos archivos.
// "100% atención personalizada" se reemplazó por las líneas de trabajo: era una frase hecha, sin un
// dato que la respalde, y las líneas (hormigón, fibra, revestimientos, cercos, cobertores,
// climatización y accesorios) sí son un hecho de la empresa.
export const TRAYECTORIA_STATS = [
  { Icon: FiAward,   n: '+30 años', l: 'de trayectoria en Villa María' },
  { Icon: FiDroplet, n: '+500',     l: 'piscinas construidas' },
  { Icon: FiLayers,  n: '7',        l: 'líneas de trabajo, de la obra al accesorio' },
  { Icon: FiClock,   n: '48 h',     l: 'para responder tu consulta' },
];

export default function StatsStrip({ stats = TRAYECTORIA_STATS }) {
  const reveal = useReveal();

  return (
    <section ref={reveal.ref} className={reveal.className} aria-label="Trayectoria de Playa & Sol"
      style={{ background: 'var(--surface-card)', padding: 'var(--space-8) var(--space-5)',
               borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="ps-stats-grid" style={{ maxWidth: 1120, margin: '0 auto' }}>
        {stats.map((s) => (
          <div key={s.l} className="ps-stat-item" style={{ textAlign: 'center', padding: '0 var(--space-5)' }}>
            <div aria-hidden="true" style={{
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
