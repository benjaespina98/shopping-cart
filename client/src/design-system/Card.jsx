export function Card({ children, padding = 'md', accent = 'none', interactive = false, className, style, onClick, ...rest }) {
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
    padding: pads[padding],
    minWidth: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
    transition: 'transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out)',
    cursor: interactive ? 'pointer' : 'default',
    ...style,
  };

  const classes = ['ps-card', interactive && 'ps-card--interactive', className].filter(Boolean).join(' ');

  // Con onClick la tarjeta es un control: se anuncia como botón, entra en el orden de tab y
  // se activa con Enter o Espacio (solo si el foco está en la tarjeta misma, para no robarle
  // las teclas a un input o enlace que esté adentro). El foco visible lo da tokens.css.
  const keyboardProps = typeof onClick === 'function' ? {
    role: 'button',
    tabIndex: 0,
    onKeyDown: (e) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    },
  } : {};

  return (
    <div className={classes} style={base} onClick={onClick} {...keyboardProps} {...rest}>
      {children}
    </div>
  );
}
