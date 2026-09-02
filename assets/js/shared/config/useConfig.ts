import { useStore } from '@nanostores/preact';

import type { Config } from './config';
import { $config } from './config.store';

/** Undefined only before the bootstrap has landed, which `app/App.tsx` renders nothing until. */
export function useConfig(): Config | undefined {
  return useStore($config);
}
