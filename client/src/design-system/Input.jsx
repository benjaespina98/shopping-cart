import { useState, useId } from 'react';

export function Input({ label, helper, error, id, leading, trailing, size = 'md', style, disabled = false, ...rest }) {
  const [focused, setFocused] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;

  const sizes = {
    md: { padding: '11px 14px', fontSize: '1rem',      minHeight: '44px' },
    lg: { padding: '14px 16px', fontSize: '1.125rem',  minHeight: '52px' },
  };

  const borderColor = error
    ? 'var(--red-500)'
    : focused ? 'var(--brand-primary)' : 'var(--border-default)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0, width: '100%', boxSizing: 'border-box', ...style }}>
      {label && (
        <label htmlFor={inputId} style={{
          fontFamily: 'var(--font-body)', fontWeight: 600,
          fontSize: '0.875rem', color: 'var(--text-strong)',
        }}>{label}</label>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
        border: `2px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        padding: sizes[size].padding,
        minHeight: sizes[size].minHeight,
        minWidth: 0,
        boxSizing: 'border-box',
        boxShadow: focused && !error ? '0 0 0 4px var(--sun-100)' : 'none',
        transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
        opacity: disabled ? 0.6 : 1,
      }}>
        {leading && <span style={{ display: 'inline-flex', color: 'var(--text-muted)' }}>{leading}</span>}
        <input
          id={inputId}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-body)', fontSize: sizes[size].fontSize,
            color: 'var(--text-strong)', minWidth: 0,
          }}
          {...rest}
        />
        {trailing && <span style={{ display: 'inline-flex', color: 'var(--text-muted)' }}>{trailing}</span>}
      </div>
      {error
        ? <span style={{ fontSize: '0.875rem', color: 'var(--red-500)', fontFamily: 'var(--font-body)' }}>{error}</span>
        : helper
        ? <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{helper}</span>
        : null}
    </div>
  );
}
