import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Quote from './Quote';
import { quotesAPI, servicesAPI } from '../services/api';

vi.mock('../services/api', () => ({
  quotesAPI: { create: vi.fn() },
  servicesAPI: { getAll: vi.fn() },
}));
vi.mock('../utils/analytics', () => ({ trackEvent: vi.fn(), trackPageview: vi.fn() }));

const renderQuote = () =>
  render(
    <MemoryRouter>
      <Quote />
    </MemoryRouter>
  );

describe('Quote — campo trampa anti-spam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    servicesAPI.getAll.mockResolvedValue({ data: [] });
    quotesAPI.create.mockResolvedValue({ data: {} });
  });

  it('renderiza el honeypot oculto, fuera del tab y sin autocompletado', async () => {
    const { container } = renderQuote();
    await waitFor(() => expect(servicesAPI.getAll).toHaveBeenCalled());

    const trap = container.querySelector('input[name="website"]');
    expect(trap).toBeInTheDocument();
    expect(trap).toHaveAttribute('tabindex', '-1');
    expect(trap).toHaveAttribute('autocomplete', 'off');
    expect(trap.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  const completarYEnviar = async (user, trapValue) => {
    const { container } = renderQuote();
    await waitFor(() => expect(servicesAPI.getAll).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/nombre y apellido/i), 'Juana Pérez');
    await user.type(screen.getByLabelText(/teléfono/i), '3534224605');
    await user.type(screen.getByLabelText('Email'), 'juana@test.com');
    if (trapValue) await user.type(container.querySelector('input[name="website"]'), trapValue);
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /solicitar presupuesto/i }));

    await waitFor(() => expect(quotesAPI.create).toHaveBeenCalledTimes(1));
  };

  it('una persona lo envía vacío', async () => {
    await completarYEnviar(userEvent.setup());
    expect(quotesAPI.create).toHaveBeenCalledWith(expect.objectContaining({ website: '' }));
  });

  it('si un bot lo completa, el valor viaja al server (que lo descarta)', async () => {
    await completarYEnviar(userEvent.setup(), 'http://spam.example');
    expect(quotesAPI.create).toHaveBeenCalledWith(
      expect.objectContaining({ website: 'http://spam.example' })
    );
  });

  describe('errores y foco', () => {
    it('enviar vacío: anuncia el error (role alert), marca el campo y le da el foco', async () => {
      const user = userEvent.setup();
      renderQuote();
      await waitFor(() => expect(servicesAPI.getAll).toHaveBeenCalled());

      await user.click(screen.getByRole('button', { name: /solicitar presupuesto/i }));

      const name = screen.getByLabelText(/nombre y apellido/i);
      expect(name).toHaveFocus();
      expect(name).toHaveAttribute('aria-invalid', 'true');
      expect(name).toHaveAccessibleDescription('Ingresá tu nombre.');
      const alerts = screen.getAllByRole('alert').map((el) => el.textContent);
      expect(alerts).toEqual(expect.arrayContaining(['Revisá los campos marcados.', 'Ingresá tu nombre.']));
      expect(quotesAPI.create).not.toHaveBeenCalled();
    });

    it('con datos válidos pero sin aceptar el consentimiento: alerta y foco en el checkbox', async () => {
      const user = userEvent.setup();
      renderQuote();
      await waitFor(() => expect(servicesAPI.getAll).toHaveBeenCalled());

      await user.type(screen.getByLabelText(/nombre y apellido/i), 'Juana Pérez');
      await user.type(screen.getByLabelText(/teléfono/i), '3534224605');
      await user.type(screen.getByLabelText('Email'), 'juana@test.com');
      await user.click(screen.getByRole('button', { name: /solicitar presupuesto/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/aceptar el uso de tus datos/i);
      expect(screen.getByRole('checkbox')).toHaveFocus();
      expect(quotesAPI.create).not.toHaveBeenCalled();
    });

    it('al corregir el campo se limpia el error y deja de estar inválido', async () => {
      const user = userEvent.setup();
      renderQuote();
      await waitFor(() => expect(servicesAPI.getAll).toHaveBeenCalled());

      await user.click(screen.getByRole('button', { name: /solicitar presupuesto/i }));
      const name = screen.getByLabelText(/nombre y apellido/i);
      await user.type(name, 'Juana');

      expect(name).not.toHaveAttribute('aria-invalid');
    });

    it('al enviar bien, el foco pasa al "¡Gracias!" para que se anuncie', async () => {
      const user = userEvent.setup();
      renderQuote();
      await waitFor(() => expect(servicesAPI.getAll).toHaveBeenCalled());

      await user.type(screen.getByLabelText(/nombre y apellido/i), 'Juana Pérez');
      await user.type(screen.getByLabelText(/teléfono/i), '3534224605');
      await user.type(screen.getByLabelText('Email'), 'juana@test.com');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /solicitar presupuesto/i }));

      const thanks = await screen.findByRole('heading', { name: '¡Gracias!' });
      await waitFor(() => expect(thanks).toHaveFocus());
    });
  });
});
