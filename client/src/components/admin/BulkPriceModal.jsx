import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { productsAPI } from '../../services/api';
import { ADJUST_MODES, ROUNDINGS, computeNewPrice, formatPrice, parseNumber } from '../../utils/bulkPrice';

// Editor masivo de precios: se aplica a los productos que están a la vista en la tabla (los filtros
// de categoría y búsqueda del panel sirven para acotar), se ve el resultado fila por fila, se puede
// retocar un precio a mano y recién al confirmar se guarda. Un solo pedido, todo o nada.
export default function BulkPriceModal({ products, onClose, onSaved }) {
  const uid = useId();
  const valueRef = useRef(null);
  const [mode, setMode] = useState('percent_up');
  const [value, setValue] = useState('');
  const [rounding, setRounding] = useState('0');
  const [selected, setSelected] = useState(() => new Set(products.map((p) => p._id)));
  // Precios retocados a mano (texto, para no pelear con lo que el usuario está tipeando).
  const [overrides, setOverrides] = useState({});
  const [saving, setSaving] = useState(false);

  // Foco inicial en el valor y, al cerrar, de vuelta en el botón que abrió el modal.
  useEffect(() => {
    const opener = document.activeElement;
    valueRef.current?.focus();
    return () => { if (opener instanceof HTMLElement) opener.focus(); };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, saving]);

  const rows = useMemo(() => products.map((p) => {
    const isSelected = selected.has(p._id);
    const calculated = isSelected ? computeNewPrice(p.price, { mode, value, rounding }) : null;
    const manual = overrides[p._id];
    const manualNumber = manual === undefined ? undefined : parseNumber(manual);
    const manualInvalid = manual !== undefined && (!Number.isFinite(manualNumber) || manualNumber < 0);
    const next = manual !== undefined && !manualInvalid ? Math.round(manualNumber * 100) / 100 : calculated;
    return { product: p, isSelected, next, manualInvalid, changed: isSelected && next !== null && next !== p.price };
  }), [products, selected, mode, value, rounding, overrides]);

  const changedRows = rows.filter((r) => r.changed);
  const hasInvalid = rows.some((r) => r.isSelected && r.manualInvalid);
  const valueOk = Number.isFinite(parseNumber(value)) && parseNumber(value) >= 0;
  const unit = ADJUST_MODES.find((m) => m.value === mode)?.unit;
  const allSelected = selected.size === products.length;

  // Cambiar la regla recalcula todo: los retoques manuales de la regla anterior ya no corresponden.
  const changeRule = (setter) => (e) => { setter(e.target.value); setOverrides({}); };

  const toggle = (id) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const handleSave = async () => {
    if (changedRows.length === 0 || hasInvalid) return;
    const sure = window.confirm(
      `¿Actualizar el precio de ${changedRows.length} producto${changedRows.length === 1 ? '' : 's'}? Se aplica enseguida en la tienda.`
    );
    if (!sure) return;

    setSaving(true);
    try {
      await productsAPI.updatePrices(changedRows.map((r) => ({ id: r.product._id, price: r.next })));
      toast.success(`Precios actualizados (${changedRows.length})`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudieron actualizar los precios');
    } finally {
      setSaving(false);
    }
  };

  const fieldId = (name) => `${uid}-${name}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ps-scrim">
      <div role="dialog" aria-modal="true" aria-labelledby={fieldId('title')}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 id={fieldId('title')} className="font-semibold text-slate-800 text-lg">Editar precios en bloque</h2>
            <p className="text-sm text-slate-600">
              Se aplica a los {products.length} producto{products.length === 1 ? '' : 's'} que ves en la tabla (filtros incluidos).
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <FiX size={18} />
          </button>
        </div>

        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-100">
          <div>
            <label className="label" htmlFor={fieldId('mode')}>Qué hacer</label>
            <select id={fieldId('mode')} className="input" value={mode} onChange={changeRule(setMode)}>
              {ADJUST_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor={fieldId('value')}>Valor ({unit})</label>
            <input id={fieldId('value')} ref={valueRef} className="input" inputMode="decimal" placeholder={unit === '%' ? 'Ej: 10' : 'Ej: 500'}
              value={value} onChange={changeRule(setValue)} />
          </div>
          <div>
            <label className="label" htmlFor={fieldId('rounding')}>Redondeo</label>
            <select id={fieldId('rounding')} className="input" value={rounding} onChange={changeRule(setRounding)}>
              {ROUNDINGS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="border-b border-slate-100">
                <th className="px-4 py-2 w-10">
                  <input type="checkbox" aria-label="Seleccionar todos" checked={allSelected}
                    onChange={() => setSelected(allSelected ? new Set() : new Set(products.map((p) => p._id)))} />
                </th>
                <th className="px-2 py-2 text-left font-semibold text-slate-600">Producto</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-600">Precio actual</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-600 w-40">Precio nuevo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ product, isSelected, next, manualInvalid, changed }) => (
                <tr key={product._id} className="border-b border-slate-50">
                  <td className="px-4 py-2">
                    <input type="checkbox" aria-label={`Incluir ${product.name}`} checked={isSelected} onChange={() => toggle(product._id)} />
                  </td>
                  <td className="px-2 py-2">
                    <div className="font-medium text-slate-800">{product.name}</div>
                    <div className="text-xs text-slate-600">{product.category}{isSelected ? '' : ' · excluido'}</div>
                  </td>
                  <td className="px-4 py-2 text-right text-slate-600">{formatPrice(product.price)}</td>
                  <td className="px-4 py-2 text-right">
                    <input
                      aria-label={`Precio nuevo de ${product.name}`}
                      aria-invalid={manualInvalid || undefined}
                      disabled={!isSelected}
                      title={isSelected ? undefined : 'Excluido del cambio'}
                      inputMode="decimal"
                      className={`input text-right py-1.5 ${manualInvalid ? 'input-error' : ''} ${changed ? 'font-semibold' : ''}`}
                      value={overrides[product._id] ?? (next === null ? '' : String(next))}
                      onChange={(e) => setOverrides((o) => ({ ...o, [product._id]: e.target.value }))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap items-center gap-3 justify-between">
          <p className="text-sm text-slate-600 flex items-center gap-2" role="status">
            {hasInvalid ? (
              <><FiAlertCircle className="text-red-500" /> Hay un precio nuevo inválido.</>
            ) : !valueOk && Object.keys(overrides).length === 0 ? (
              'Ingresá un valor para ver los precios nuevos.'
            ) : (
              <>{changedRows.length} producto{changedRows.length === 1 ? '' : 's'} con cambios</>
            )}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>Cancelar</button>
            <button type="button" onClick={handleSave} className="btn-primary" disabled={saving || hasInvalid || changedRows.length === 0}>
              {saving ? 'Guardando...' : `Aplicar a ${changedRows.length}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
