// Avisos (toasts) sin cargar react-toastify en el arranque: la librería y su CSS (~9 KB gzip, más
// una hoja que bloquea el render) solo se descargan cuando hay algo que mostrar. Si el contenedor
// (ToastHost) todavía no montó, react-toastify deja el aviso en cola y lo muestra al montar.
const call = (method, message) =>
  import('react-toastify')
    .then(({ toast }) => toast[method](message))
    .catch(() => {});

export const notify = {
  success: (message) => call('success', message),
  error: (message) => call('error', message),
};
