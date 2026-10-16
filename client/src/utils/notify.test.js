import { describe, it, expect, vi } from 'vitest';

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('react-toastify', () => ({ toast }));

import { notify } from './notify';

describe('notify', () => {
  it('delega en react-toastify cargándolo recién al usarse', async () => {
    await notify.success('listo');
    await notify.error('falló');
    expect(toast.success).toHaveBeenCalledWith('listo');
    expect(toast.error).toHaveBeenCalledWith('falló');
  });
});
