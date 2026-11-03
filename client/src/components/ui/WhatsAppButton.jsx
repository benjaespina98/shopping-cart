import { FaWhatsapp } from 'react-icons/fa';
import { Button } from '../../design-system/Button';
import { useSettings } from '../../context/SettingsContext';
import { trackEvent } from '../../utils/analytics';
import { WHATSAPP_GREETING, whatsappUrl } from '../../utils/whatsapp';

// Botón "Escribinos por WhatsApp" reutilizable: mismo número (el del panel), mensaje inicial con
// contexto y medición del clic. `location` dice desde qué sección se hizo clic (hero, cta, servicios…).
export default function WhatsAppButton({
  children = 'Escribinos por WhatsApp',
  text = WHATSAPP_GREETING,
  location,
  variant = 'outline',
  onClick,
  ...rest
}) {
  const { settings } = useSettings();

  return (
    <Button
      variant={variant}
      href={whatsappUrl(settings.whatsappNumber, text)}
      target="_blank"
      rel="noopener noreferrer"
      iconLeft={<FaWhatsapp size={18} />}
      onClick={(e) => {
        trackEvent('click_whatsapp', { location });
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </Button>
  );
}
