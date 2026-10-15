import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';
import Contact from './Contact';
import { SettingsProvider } from '../context/SettingsContext';
import { quotesAPI, settingsAPI } from '../services/api';

vi.mock('../services/api', () => ({
  quotesAPI: { create: vi.fn() },
  settingsAPI: { getPublic: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from 'react-toastify';

const renderContact = () =>
  render(
    <SettingsProvider>
      <Contact />
    </SettingsProvider>
  );

const llenarCampos = async (user, { name, phone, email, message }) => {
  if (name !== undefined) await user.type(screen.getByLabelText('Nombre'), name);
  if (phone !== undefined) await user.type(screen.getByLabelText('Teléfono'), phone);
  if (email !== undefined) await user.type(screen.getByLabelText('Email'), email);
  if (message !== undefined) await user.type(screen.getByLabelText('Mensaje'), message);
};

describe('Contact — validación del formulario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    settingsAPI.getPublic.mockResolvedValue({ data: {} });
  });

  // Regresión: antes solo chequeaba que los campos no estuvieran vacíos — un email
  // "asdf" o un teléfono de un dígito pasaban igual, y el lead quedaba sin forma real de
  // contactarlo. No debe llamar a quotesAPI.create ni abrir WhatsApp con datos inválidos.
  it('rechaza un email con formato inválido y marca el campo', async () => {
    const user = userEvent.setup();
    renderContact();

    await llenarCampos(user, { name: 'Juan', phone: '3534224605', email: 'no-es-un-email', message: 'Consulta de prueba' });
    await user.click(screen.getByRole('link', { name: /enviar por whatsapp/i }));

    expect(await screen.findByText('Ingresá un email válido.')).toBeInTheDocument();
    expect(quotesAPI.create).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it('rechaza un teléfono demasiado corto', async () => {
    const user = userEvent.setup();
    renderContact();

    await llenarCampos(user, { name: 'Juan', phone: '12', email: 'juan@test.com', message: 'Consulta de prueba' });
    await user.click(screen.getByRole('link', { name: /enviar por whatsapp/i }));

    expect(await screen.findByText('Ingresá un teléfono válido.')).toBeInTheDocument();
    expect(quotesAPI.create).not.toHaveBeenCalled();
  });

  it('con datos válidos, guarda la consulta y limpia los errores', async () => {
    const user = userEvent.setup();
    quotesAPI.create.mockResolvedValue({});
    vi.spyOn(window, 'open').mockReturnValue({ closed: false, location: { href: '' } });

    renderContact();

    await llenarCampos(user, { name: 'Juan', phone: '3534224605', email: 'juan@test.com', message: 'Consulta de prueba' });
    await user.click(screen.getByRole('link', { name: /enviar por whatsapp/i }));

    expect(quotesAPI.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Juan', phone: '3534224605', email: 'juan@test.com', message: 'Consulta de prueba', source: 'contact',
      website: '',
    }));
    expect(screen.queryByText(/ingresá un/i)).not.toBeInTheDocument();
  });

  // El honeypot es un campo oculto que un bot rellena y una persona no: debe viajar en el
  // payload (el server lo descarta), no debe poder alcanzarse con Tab y no debe leerse.
  it('incluye el campo trampa oculto, fuera del tab y de los lectores de pantalla', async () => {
    const user = userEvent.setup();
    quotesAPI.create.mockResolvedValue({});
    vi.spyOn(window, 'open').mockReturnValue({ closed: false, location: { href: '' } });

    const { container } = renderContact();
    const trap = container.querySelector('input[name="website"]');

    expect(trap).toBeInTheDocument();
    expect(trap).toHaveAttribute('tabindex', '-1');
    expect(trap).toHaveAttribute('autocomplete', 'off');
    expect(trap.closest('[aria-hidden="true"]')).not.toBeNull();

    await llenarCampos(user, { name: 'Bot', phone: '3534224605', email: 'bot@test.com', message: 'spam' });
    await user.type(trap, 'http://spam.example');
    await user.click(screen.getByRole('link', { name: /enviar por whatsapp/i }));

    expect(quotesAPI.create).toHaveBeenCalledWith(expect.objectContaining({ website: 'http://spam.example' }));
  });

  // El envío por WhatsApp es un <a target="_blank" rel="noopener noreferrer">: sin window.open y sin
  // pestaña en blanco. El mensaje prearmado va en la URL.
  it('WhatsApp es un enlace real con target _blank, rel noopener noreferrer y el mensaje prearmado', async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, 'open');
    renderContact();

    await llenarCampos(user, { name: 'Juana', phone: '3534224605', email: 'juana@test.com', message: 'Quiero una piscina' });
    const link = screen.getByRole('link', { name: /enviar por whatsapp/i });

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    const url = new URL(link.getAttribute('href'));
    expect(url.origin).toBe('https://wa.me');
    const text = url.searchParams.get('text');
    expect(text).toContain('Hola! Soy Juana');
    expect(text).toContain('3534224605');
    expect(text).toContain('Quiero una piscina');
    expect(open).not.toHaveBeenCalled();
  });

  it('con datos inválidos el enlace no navega (se previene el clic) y marca el primer error con foco', async () => {
    const user = userEvent.setup();
    renderContact();

    await llenarCampos(user, { name: 'Juana', phone: '12', email: 'juana@test.com', message: 'Hola' });
    const link = screen.getByRole('link', { name: /enviar por whatsapp/i });
    const notPrevented = fireEvent.click(link);

    expect(notPrevented).toBe(false);
    expect(quotesAPI.create).not.toHaveBeenCalled();
    const phone = screen.getByLabelText('Teléfono');
    expect(phone).toHaveFocus();
    expect(phone).toHaveAttribute('aria-invalid', 'true');
    expect(phone).toHaveAccessibleDescription('Ingresá un teléfono válido.');
  });

  it('con datos válidos el clic no se previene y la consulta se guarda sin esperar', async () => {
    quotesAPI.create.mockResolvedValue({});
    const user = userEvent.setup();
    renderContact();

    await llenarCampos(user, { name: 'Juana', phone: '3534224605', email: 'juana@test.com', message: 'Hola' });
    const link = screen.getByRole('link', { name: /enviar por whatsapp/i });
    const notPrevented = fireEvent.click(link);

    expect(notPrevented).toBe(true);
    expect(quotesAPI.create).toHaveBeenCalledTimes(1);
  });

  it('el clic medio también valida: con datos inválidos no abre WhatsApp', async () => {
    const user = userEvent.setup();
    renderContact();

    await llenarCampos(user, { name: 'Juana', phone: '12', email: 'juana@test.com', message: 'Hola' });
    const link = screen.getByRole('link', { name: /enviar por whatsapp/i });
    const notPrevented = fireEvent(link, new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 }));

    expect(notPrevented).toBe(false);
    expect(quotesAPI.create).not.toHaveBeenCalled();
  });
});
