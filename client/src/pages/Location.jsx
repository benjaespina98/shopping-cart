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
    <div className="bg-slate-100 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="section-eyebrow">Showroom</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">Visitanos en persona</h1>
          <p className="text-slate-700 text-xl font-semibold">
            Conocé nuestro local con atención personalizada. Te esperamos.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
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
            <div className="card p-7 bg-gradient-to-br from-sky-50/50 to-white border-sky-100">
              <h2 className="font-bold text-slate-900 text-xl mb-6">Información del local</h2>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <FiMapPin size={22} className="text-primary-700" />
                </div>
                <div>
                  <p className="text-base text-slate-500 font-bold mb-1">Dirección</p>
                  <p className="text-lg font-bold text-slate-800">{LOCATION.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <FiClock size={22} className="text-primary-700" />
                </div>
                <div>
                  <p className="text-base text-slate-500 font-bold mb-2">Horarios</p>
                  <div className="space-y-1.5 text-base text-slate-700 font-medium">
                    <p><span className="font-bold">Lun – Vie:</span> 9:00 – 18:00</p>
                    <p><span className="font-bold">Sábados:</span> 9:00 – 13:00</p>
                    <p className="text-slate-500"><span className="font-bold">Domingos:</span> Cerrado</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <FiPhone size={22} className="text-primary-700" />
                </div>
                <div>
                  <p className="text-base text-slate-500 font-bold mb-1">Teléfono</p>
                  <a href="tel:+543534224607" className="text-lg font-bold text-primary-700 hover:underline">
                    3534224607
                  </a>
                </div>
              </div>

              {/* Direction button */}
              <a
                href={LOCATION.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-primary-700 text-white font-bold py-3 rounded-xl hover:bg-primary-800 transition-colors active:scale-95 shadow-sm"
              >
                <FiNavigation size={18} />
                Cómo llegar
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
