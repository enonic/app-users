import { atom } from 'nanostores';

import type { Host } from '../sections';
import { followPath } from './routing';

/**
 * ? The host object reaches deep components through a store rather than context: everything else in
 * ? this app is a nanostore, and it is set once per mount and never replaced.
 */
export const $host = atom<Host | undefined>(undefined);

/** Called by `mount`, and the only place the host object enters the section. */
export function setHost(host: Host): void {
  $host.set(host);
  followPath(host);
}
