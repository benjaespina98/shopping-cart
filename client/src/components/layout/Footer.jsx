import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1 mb-3">
              <span className="text-2xl font-extrabold text-brand">Playa</span>
              <span className="text-2xl font-extrabold text-white">y Sol</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Especialistas en piscinas, tratamiento de agua y accesorios. Tu pileta, nuestra pasión.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-brand transition-colors">
                <FiInstagram size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-brand transition-colors">
                <FiFacebook size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navegación</h3>
            <ul className="space-y-2 text-sm">
              {[['/', 'Inicio'], ['/tienda', 'Tienda'], ['/contacto', 'Contacto'], ['/ubicacion', 'Ubicación']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-brand transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <FiMapPin size={15} className="text-brand shrink-0" />
                <span>Corrientes 1210, Villa María, Cba.</span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone size={15} className="text-brand shrink-0" />
                <a href="tel:+543534224607" className="hover:text-brand">3534224607</a>
              </li>
              <li className="flex items-center gap-2">
                <FiMail size={15} className="text-brand shrink-0" />
                <a href="mailto:benjaespina98@gmail.com" className="hover:text-brand">benjaespina98@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <span>© {new Date().getFullYear()} Playa y Sol. Todos los derechos reservados.</span>
          <Link to="/admin/login" className="hover:text-slate-400 transition-colors">Portal admin</Link>
        </div>
      </div>
    </footer>
  );
}
