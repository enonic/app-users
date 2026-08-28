import { vi } from 'vitest';

export const apiUrl = vi.fn<(params: { api: string; type?: string; path?: string }) => string>();
