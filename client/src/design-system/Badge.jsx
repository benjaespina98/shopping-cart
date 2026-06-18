export function Badge({ children, tone = 'neutral', variant = 'soft', size = 'md', dot = false, style, ...rest }) {
  const palettes = {
    neutral: { soft: ['var(--grey-100)', 'var(--grey-700)'], solid: ['var(--grey-700)', '#fff'] },
    teal:    { soft: ['var(--teal-50)', 'var(--teal-700)'], solid: ['var(--teal-700)', '#fff'] },
    sun:     { soft: ['var(--sun-100)', 'var(--sun-800)'], solid: ['var(--sun-500)', 'var(--teal-900)'] },
    success: { soft: ['var(--green-100)', '#1c6e48'],      solid: ['var(--green-500)', '#fff'] },
    warning: { soft: ['var(--amber-100)', '#9a5e10'],      solid: ['var(--amber-500)', '#fff'] },
    danger:  { soft: ['var(--red-100)', '#9e2f1f'],        solid: ['var(--red-500)', '#fff'] },
  };
  const [bg, fg] = palettes[tone]?.[variant] ?? palettes.neutral.soft;
  const sizes = {
    sm: { padding: '2px 8px',  fontSize: '0.6875rem' },
    md: { padding: '4px 10px', fontSize: '0.75rem' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: bg,
        color: fg,
        padding: sizes[size].padding,
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: sizes[size].fontSize,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        borderRadius: 'var(--radius-pill)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {dot ? <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} /> : null}
      {children}
    </span>
  );
}
