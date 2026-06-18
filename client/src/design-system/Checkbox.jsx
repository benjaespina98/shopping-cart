import { useState, useId } from 'react';

export function Checkbox({ label, checked, defaultChecked, onChange, disabled = false, id, style, ...rest }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked || false);
  const on = isControlled ? checked : internal;

  const toggle = (e) => {
    if (disabled) return;
    if (!isControlled) setInternal(e.target.checked);
    onChange?.(e);
  };

  return (
    <label htmlFor={inputId} style={{
      display: 'inline-flex', alignItems: 'center', gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-body)',
      ...style,
    }}>
      <input id={inputId} type="checkbox" checked={on} onChange={toggle} disabled={disabled}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} {...rest} />
      <span style={{
        width: '22px', height: '22px', flexShrink: 0,
        borderRadius: 'var(--radius-xs)',
        border: on ? '2px solid var(--brand-primary)' : '2px solid var(--border-default)',
        background: on ? 'var(--brand-primary)' : 'var(--surface-card)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all var(--duration-fast) var(--ease-out)',
      }}>
        {on && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="var(--sun-500)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
