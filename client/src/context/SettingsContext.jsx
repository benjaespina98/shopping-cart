import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { settingsAPI } from '../services/api';

// Un único punto de verdad para los datos de contacto del sitio público.
//
// Antes cada componente que necesitaba el WhatsApp o los horarios llamaba por su cuenta
// a /settings/public: PublicLayout, Footer, WhatsAppFloat, Contacto y Nosotros. Abrir
// /contacto disparaba cuatro peticiones idénticas en paralelo — cuatro cold starts
// posibles del serverless, cuatro consultas a Mongo y cuatro slots del rate limiter
// (que está en 100 peticiones cada 15 minutos por IP). Ahora se pide una sola vez acá.
//
// Los valores por defecto también vivían duplicados en cinco archivos, con riesgo de
// quedar desfasados entre sí. Quedan definidos una vez.
export const DEFAULT_SETTINGS = {
  theme: 'default',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '5493534224605',
  phoneNumberDisplay: '3534224605',
  phoneNumberLink: 'tel:+543534224605',
  contactEmail: 'piscinas@playaysol.com.ar',
  secondaryContactLabel: '',
  secondaryContactWhatsapp: '',
  contactPhotoUrl: '',
  aboutPhotoUrl: '',
  businessHours: [
    { day: 'Lunes a Viernes', hours: '9:00 - 18:00' },
    { day: 'Sábados', hours: '9:00 - 13:00' },
    { day: 'Domingos', hours: 'Cerrado' },
  ],
};

const SettingsContext = createContext({ settings: DEFAULT_SETTINGS, loading: true });

// Combina la respuesta del servidor con los defaults, campo por campo: si el admin
// dejó un campo vacío no queremos pintar un hueco, queremos el valor de respaldo.
const mergeSettings = (data) => ({
  ...DEFAULT_SETTINGS,
  ...Object.fromEntries(
    Object.entries(data || {}).filter(([, value]) => value !== null && value !== undefined && value !== '')
  ),
  businessHours: Array.isArray(data?.businessHours) && data.businessHours.length > 0
    ? data.businessHours
    : DEFAULT_SETTINGS.businessHours,
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    settingsAPI.getPublic()
      .then(({ data }) => {
        if (!cancelled) setSettings(mergeSettings(data));
      })
      .catch(() => {
        // Sin conexión con la API el sitio sigue navegable con los valores de respaldo.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Tema visual elegido en /admin/configuracion (sólo radios y sombras; los colores de
  // marca y la tipografía no cambian). "default" no setea el atributo.
  useEffect(() => {
    if (settings.theme && settings.theme !== 'default') {
      document.documentElement.setAttribute('data-theme', settings.theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [settings.theme]);

  const value = useMemo(() => ({ settings, loading }), [settings, loading]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
