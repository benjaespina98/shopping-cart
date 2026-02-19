import { FiMapPin, FiClock, FiNavigation, FiPhone } from 'react-icons/fi';

// Replace with your actual coordinates and address
const LOCATION = {
  address: 'Corrientes 1210, Villa María, Córdoba',
  lat: -32.4119579,
  lng: -63.2412875,
  mapsUrl: 'https://www.google.com/maps/place/Playa+y+Sol+S.A.S./@-32.41136540202374,-63.24136445912394,17z',
  embedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d210.51818044720216!2d-63.24136445912394!3d-32.41136540202374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95cc42e708785177%3A0x7029a4a01828b49f!2sPlaya%20y%20Sol%20S.A.S.!5e0!3m2!1ses-419!2sar!4v1771459205088!5m2!1ses-419!2sar',
};

export default function Location() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Nuestra Ubicación</h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Visitanos en nuestro local. Estamos listos para atenderte.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Map */}
        <div className="md:col-span-3 card overflow-hidden">
          <iframe
            title="Ubicación del local"
            src={LOCATION.embedUrl}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg">Información del local</h2>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center shrink-0 mt-0.5">
                <FiMapPin size={18} className="text-brand" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-0.5">Dirección</p>
                <p className="text-sm font-medium text-slate-700">{LOCATION.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center shrink-0 mt-0.5">
                <FiClock size={18} className="text-brand" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Horarios</p>
                <div className="space-y-0.5 text-sm text-slate-600">
                  <p><span className="font-medium">Lun – Vie:</span> 9:00 – 18:00</p>
                  <p><span className="font-medium">Sábados:</span> 9:00 – 13:00</p>
                  <p className="text-slate-400"><span className="font-medium">Domingos:</span> Cerrado</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center shrink-0 mt-0.5">
                <FiPhone size={18} className="text-brand" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-0.5">Teléfono</p>
                <a href="tel:+543534224607" className="text-sm font-medium text-brand hover:underline">
                  3534224607
                </a>
              </div>
            </div>
          </div>

          {/* Direction button */}
          <a
            href={LOCATION.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-brand text-white font-semibold py-3 rounded-xl hover:bg-brand-dark transition-colors active:scale-95"
          >
            <FiNavigation size={17} />
            Cómo llegar
          </a>
        </div>
      </div>
    </div>
  );
}
