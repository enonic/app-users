import { atom } from 'nanostores';

import type { Config } from './config';

// Fetched after mount rather than read from the page, so the store starts empty instead of carrying a
// fake default. `app/App.tsx` renders nothing until the bootstrap has filled it.
export const $config = atom<Config | undefined>(undefined);

export function setConfig(config: Config): void {
  $config.set(config);
}

// ! Read at render, not subscribed to: `App` renders nothing until the bootstrap filled the store.
export function isReadOnlyMode(): boolean {
  return $config.get()?.readOnlyMode === true;
}

// ! Read at render, for the reason `isReadOnlyMode` gives.
export function isAdministrator(): boolean {
  return $config.get()?.administrator === true;
}

export function isCurrentUser(key: string): boolean {
  return $config.get()?.userKey === key;
}
