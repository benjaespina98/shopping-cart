// Avisos (toasts) sin cargar react-toastify en el arranque: la librería y su CSS (~9 KB gzip, más
// una hoja que bloquea el render) solo se descargan cuando hay algo que mostrar. Si el contenedor
// (ToastHost) todavía no montó, react-toastify deja el aviso en cola y lo muestra al montar.
const call = (method, message) =>
  import('react-toastify')
    .then(({ toast }) => toast[method](message))
    // Sin la librería (sin red, o un chunk con hash viejo tras un deploy) el aviso no se puede mostrar;
    // queda al menos en la consola en lugar de perderse sin rastro.
    .catch((err) => console.error('No se pudo mostrar el aviso:', message, err));

export const notify = {
  success: (message) => call('success', message),
  error: (message) => call('error', message),
};
