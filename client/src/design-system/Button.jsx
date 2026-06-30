export function Button({
  children,
  variant = 'primary',
  size = 'md',
  shape = 'soft',
  inverse = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  style,
  ...rest
}) {
  const sizes = {
    sm: { padding: '8px 16px', fontSize: 'var(--text-sm, 0.875rem)', gap: '6px', minHeight: '36px' },
    md: { padding: '11px 22px', fontSize: '1rem', gap: '8px', minHeight: '44px' },
    lg: { padding: '15px 30px', fontSize: '1.125rem', gap: '10px', minHeight: '54px' },
  };

  const variants = {
    primary: {
      background: 'var(--brand-accent)',
      color: 'var(--text-on-accent)',
      border: '2px solid transparent',
      boxShadow: 'var(--shadow-accent)',
    },
    secondary: {
      background: 'var(--brand-primary)',
      color: 'var(--text-inverse)',
      border: '2px solid transparent',
      boxShadow: 'var(--shadow-sm)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--brand-primary)',
      border: '2px solid var(--border-strong)',
      boxShadow: 'none',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--brand-primary)',
      border: '2px solid transparent',
      boxShadow: 'none',
    },
  };

  // On dark backgrounds (hero, CTA blocks), outline/ghost flip to a light-on-teal treatment
  // instead of callers hardcoding `color:'#fff'` / rgba borders per-section.
  const inverseOverrides = {
    outline: {
      color: 'var(--text-inverse)',
      border: '2px solid var(--border-on-dark)',
    },
    ghost: {
      color: 'var(--text-inverse)',
      border: '2px solid transparent',
    },
  };
  if (inverse && inverseOverrides[variant]) {
    Object.assign(variants[variant], inverseOverrides[variant]);
  }

  const base = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes[size].gap,
    padding: sizes[size].padding,
    minHeight: sizes[size].minHeight,
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: sizes[size].fontSize,
    letterSpacing: '0.01em',
    lineHeight: 1,
    borderRadius: shape === 'pill' ? 'var(--radius-pill)' : 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'transform var(--duration-fast) var(--ease-out), filter var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)',
    whiteSpace: 'nowrap',
    ...variants[variant],
    ...style,
  };

  const hoverHandlers = disabled ? {} : {
    onMouseEnter: (e) => {
      if (variant === 'primary') e.currentTarget.style.background = 'var(--brand-accent-hover)';
      else if (variant === 'secondary') e.currentTarget.style.background = 'var(--brand-primary-hover)';
      else if (inverse) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
      else e.currentTarget.style.background = 'var(--brand-primary-soft)';
    },
    onMouseLeave: (e) => { e.currentTarget.style.background = variants[variant].background; },
    onMouseDown: (e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.99)'; },
    onMouseUp: (e) => { e.currentTarget.style.transform = 'none'; },
  };

  return (
    <button type={type} disabled={disabled} onClick={onClick} style={base} {...hoverHandlers} {...rest}>
      {iconLeft ? <span style={{ display: 'inline-flex' }}>{iconLeft}</span> : null}
      {children}
      {iconRight ? <span style={{ display: 'inline-flex' }}>{iconRight}</span> : null}
    </button>
  );
}
