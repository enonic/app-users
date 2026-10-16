import type { Repository } from '@enonic-types/lib-repo';
import { vi } from 'vitest';

export const list = vi.fn<() => Repository[]>();

export const get = vi.fn<(id: string) => Repository | null>();
