import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    await user.click(screen.getByRole('button', { name: /enviar por whatsapp/i }));

    expect(await screen.findByText('Ingresá un email válido.')).toBeInTheDocument();
    expect(quotesAPI.create).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it('rechaza un teléfono demasiado corto', async () => {
    const user = userEvent.setup();
    renderContact();

    await llenarCampos(user, { name: 'Juan', phone: '12', email: 'juan@test.com', message: 'Consulta de prueba' });
    await user.click(screen.getByRole('button', { name: /enviar por whatsapp/i }));

    expect(await screen.findByText('Ingresá un teléfono válido.')).toBeInTheDocument();
    expect(quotesAPI.create).not.toHaveBeenCalled();
  });

  it('con datos válidos, guarda la consulta y limpia los errores', async () => {
    const user = userEvent.setup();
    quotesAPI.create.mockResolvedValue({});
    vi.spyOn(window, 'open').mockReturnValue({ closed: false, location: { href: '' } });

    renderContact();

    await llenarCampos(user, { name: 'Juan', phone: '3534224605', email: 'juan@test.com', message: 'Consulta de prueba' });
    await user.click(screen.getByRole('button', { name: /enviar por whatsapp/i }));

    expect(quotesAPI.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Juan', phone: '3534224605', email: 'juan@test.com', message: 'Consulta de prueba', source: 'contact',
    }));
    expect(screen.queryByText(/ingresá un/i)).not.toBeInTheDocument();
  });
});
