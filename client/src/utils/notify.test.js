import { describe, it, expect, vi } from 'vitest';

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('react-toastify', () => ({ toast }));

import { notify } from './notify';

describe('notify', () => {
  it('si react-toastify falla, no tira error y deja el mensaje en la consola', async () => {
    toast.success.mockImplementationOnce(() => { throw new Error('chunk'); });
    const consola = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(notify.success('hola')).resolves.toBeUndefined();
    expect(consola).toHaveBeenCalled();
    consola.mockRestore();
  });


  it('delega en react-toastify cargándolo recién al usarse', async () => {
    await notify.success('listo');
    await notify.error('falló');
    expect(toast.success).toHaveBeenCalledWith('listo');
    expect(toast.error).toHaveBeenCalledWith('falló');
  });
});
