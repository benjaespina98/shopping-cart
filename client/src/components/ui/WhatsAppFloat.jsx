import { FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '../../context/SettingsContext';

export default function WhatsAppFloat() {
  const { settings } = useSettings();

  return (
    <a
      href={`https://wa.me/${settings.whatsappNumber}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Abrir WhatsApp"
      className="fixed bottom-5 right-5 z-30 group"
    >
      <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none hidden sm:block whitespace-nowrap">
        Escribinos por WhatsApp
      </span>
      <div className="flex items-center justify-center bg-green-500 text-white w-[54px] h-[54px] rounded-full shadow-md hover:bg-green-600 transition-colors">
        <FaWhatsapp size={22} />
      </div>
    </a>
  );
}