import { useState, useId } from 'react';

export function Switch({ label, checked, defaultChecked, onChange, disabled = false, id, style, ...rest }) {
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
      display: 'inline-flex', alignItems: 'center', gap: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-body)',
      ...style,
    }}>
      <input id={inputId} type="checkbox" role="switch" checked={on} onChange={toggle} disabled={disabled}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} {...rest} />
      <span style={{
        width: '46px', height: '26px', flexShrink: 0, borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--brand-primary)' : 'var(--grey-300)',
        position: 'relative', transition: 'background var(--duration-normal) var(--ease-out)',
      }}>
        <span style={{
          position: 'absolute', top: '3px', left: on ? '23px' : '3px',
          width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
          boxShadow: 'var(--shadow-sm)',
          transition: 'left var(--duration-normal) var(--ease-out)',
        }} />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
