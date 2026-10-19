import { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { afterLoadAndIdle } from '../../utils/idle';
import { rememberSettings, warmPublicRoutes } from '../../utils/routePrefetch';

// No dibuja nada: cuando la home terminó de cargar y el navegador está libre, adelanta los chunks, los
// datos y la primera foto de las demás secciones (ver utils/routePrefetch.js).
export default function RouteWarmup() {
  const { settings } = useSettings();

  useEffect(() => { rememberSettings(settings); }, [settings]);

  useEffect(() => {
    afterLoadAndIdle(() => warmPublicRoutes(), { timeout: 6000, fallbackDelay: 4000 });
  }, []);

  return null;
}
