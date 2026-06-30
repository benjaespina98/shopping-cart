export function Card({ children, padding = 'md', accent = 'none', interactive = false, style, onClick, ...rest }) {
  const pads = { none: '0', sm: 'var(--space-4)', md: 'var(--space-5)', lg: 'var(--space-7)' };
  const accents = {
    none: '1px solid var(--border-subtle)',
    sun:  '3px solid var(--brand-accent)',
    teal: '3px solid var(--brand-primary)',
  };

  const base = {
    background: 'var(--surface-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-subtle)',
    borderTop: accents[accent],
    boxShadow: 'var(--shadow-md)',
    padding: pads[padding],
    minWidth: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
    transition: 'transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out)',
    cursor: interactive ? 'pointer' : 'default',
    ...style,
  };

  const hoverHandlers = interactive ? {
    onMouseEnter: (e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    },
  } : {};

  return (
    <div style={base} onClick={onClick} {...hoverHandlers} {...rest}>
      {children}
    </div>
  );
}
