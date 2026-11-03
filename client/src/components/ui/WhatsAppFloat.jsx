import { useLocation } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '../../context/SettingsContext';
import { trackEvent } from '../../utils/analytics';
import { whatsappMessageFor, whatsappUrl } from '../../utils/whatsapp';

export default function WhatsAppFloat() {
  const { settings } = useSettings();
  const { pathname } = useLocation();

  return (
    <a
      href={whatsappUrl(settings.whatsappNumber, whatsappMessageFor(pathname))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      onClick={() => trackEvent('click_whatsapp', { location: 'float', page_path: pathname })}
      className="fixed bottom-5 right-5 z-30 group"
    >
      <span className="absolute right-[76px] top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all pointer-events-none hidden sm:block whitespace-nowrap">
        Escribinos por WhatsApp
      </span>
      {/* Era chico (54px) para un botón que queda flotando solo sobre el contenido en
          cada página del sitio — se sube a 64px, tamaño más habitual para este patrón. */}
      <div className="flex items-center justify-center bg-green-500 text-white w-16 h-16 rounded-full shadow-lg hover:bg-green-600 transition-colors">
        <FaWhatsapp size={30} />
      </div>
    </a>
  );
}
