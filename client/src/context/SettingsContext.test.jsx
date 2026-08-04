import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SettingsProvider, useSettings, DEFAULT_SETTINGS } from './SettingsContext';
import { settingsAPI } from '../services/api';

vi.mock('../services/api', () => ({
  settingsAPI: { getPublic: vi.fn() },
}));

function Consumidor({ campo = 'whatsappNumber' }) {
  const { settings, loading } = useSettings();
  return <span data-testid="valor">{loading ? 'cargando' : String(settings[campo])}</span>;
}

const renderConTresConsumidores = () =>
  render(
    <SettingsProvider>
      <Consumidor />
      <Consumidor />
      <Consumidor />
    </SettingsProvider>
  );

describe('SettingsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.removeAttribute('data-theme');
  });

  it('pide la configuración una sola vez aunque la consuman varios componentes', async () => {
    settingsAPI.getPublic.mockResolvedValue({ data: { whatsappNumber: '5490000000000' } });

    renderConTresConsumidores();

    await waitFor(() => expect(screen.getAllByTestId('valor')[0]).toHaveTextContent('5490000000000'));
    // Este era el problema original: Navbar, Footer, botón flotante, Contacto y Nosotros
    // pedían /settings/public cada uno por su cuenta.
    expect(settingsAPI.getPublic).toHaveBeenCalledTimes(1);
  });

  it('completa con los valores por defecto los campos que el admin dejó vacíos', async () => {
    settingsAPI.getPublic.mockResolvedValue({ data: { whatsappNumber: '', contactEmail: 'nuevo@playaysol.com.ar' } });

    render(
      <SettingsProvider>
        <Consumidor campo="whatsappNumber" />
      </SettingsProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('valor')).toHaveTextContent(DEFAULT_SETTINGS.whatsappNumber)
    );
  });

  it('mantiene el sitio usable si la API no responde', async () => {
    settingsAPI.getPublic.mockRejectedValue(new Error('network'));

    render(
      <SettingsProvider>
        <Consumidor campo="contactEmail" />
      </SettingsProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('valor')).toHaveTextContent(DEFAULT_SETTINGS.contactEmail)
    );
  });

  it('aplica el tema elegido en el panel y lo quita al volver a "default"', async () => {
    settingsAPI.getPublic.mockResolvedValue({ data: { theme: 'elegante' } });

    const { unmount } = render(<SettingsProvider><Consumidor campo="theme" /></SettingsProvider>);
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'elegante'));
    unmount();

    settingsAPI.getPublic.mockResolvedValue({ data: { theme: 'default' } });
    render(<SettingsProvider><Consumidor campo="theme" /></SettingsProvider>);
    await waitFor(() => expect(document.documentElement).not.toHaveAttribute('data-theme'));
  });

  it('usa los horarios del negocio y cae al respaldo si vienen vacíos', async () => {
    settingsAPI.getPublic.mockResolvedValue({ data: { businessHours: [] } });

    function Horarios() {
      const { settings } = useSettings();
      return <span data-testid="valor">{settings.businessHours.length}</span>;
    }

    render(<SettingsProvider><Horarios /></SettingsProvider>);

    await waitFor(() =>
      expect(screen.getByTestId('valor')).toHaveTextContent(String(DEFAULT_SETTINGS.businessHours.length))
    );
  });
});
