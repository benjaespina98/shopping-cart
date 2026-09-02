import { useState } from 'react';
import { toast } from 'react-toastify';

// Reordenar con las flechas ↑↓ era el mismo patrón, copiado, en AdminSite.jsx y
// AdminServices.jsx: mover optimistamente en el estado local, mandar el nuevo orden al
// server y, si falla, recargar desde ahí para no quedar desincronizado.
//
// `reordering` corta clicks concurrentes: sin eso, dos clicks casi simultáneos disparaban
// dos PUT /reorder con distintas fotos del orden, y el que respondiera último "ganaba" en
// silencio — el bug que motivó esto vivía duplicado en los dos archivos por separado.
export function useReorderableList({ items, setItems, reorderApi, reload, errorMessage = 'Error al reordenar.' }) {
  const [reordering, setReordering] = useState(false);

  const handleMove = async (index, dir) => {
    if (reordering) return;
    const next = [...items];
    const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[index], next[swapIdx]] = [next[swapIdx], next[index]];
    const updated = next.map((item, i) => ({ ...item, order: i }));
    setItems(updated);
    setReordering(true);
    try {
      await reorderApi(updated.map(({ _id, order }) => ({ id: _id, order })));
    } catch {
      toast.error(errorMessage);
      await reload();
    } finally {
      setReordering(false);
    }
  };

  return { reordering, handleMove };
}
