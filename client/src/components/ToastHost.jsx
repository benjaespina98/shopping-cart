import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contenedor de avisos. Se carga diferido desde main.jsx (ver utils/notify.js).
export default function ToastHost() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="colored"
    />
  );
}
