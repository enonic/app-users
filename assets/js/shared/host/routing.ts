import { useStore } from '@nanostores/preact';
import { atom } from 'nanostores';

import type { Host } from '../sections';
import { $host } from './host.store';

/**
 * The selected row, as the section's own sub-path carries it: `/` is the list with nothing open,
 * `/<key>` is that item.
 *
 * ? A section has exactly one nested route — the details of one principal — so the host's `path` is
 * ? the whole of its routing. app-settings expressed the same thing with a router because the shell
 * ? owns several sections at once; here `host.navigate` is the only history there is.
 */
export const $itemId = atom<string | undefined>(undefined);

export function followPath(host: Host): () => void {
  // ! Read before subscribing: `path` does not call back on subscribe (app-settings
  // ! `host-facts.md`), so a deep link would otherwise leave its row unopened until the first
  // ! navigation.
  $itemId.set(itemIdOf(host.path.get()));

  return host.path.subscribe((path) => $itemId.set(itemIdOf(path)));
}

export function useItemId(): string | undefined {
  return useStore($itemId);
}

export function openItem(key: string): void {
  $host.get()?.navigate(`/${encodeURIComponent(key)}`, { replace: true });
}

export function closeItem(): void {
  $host.get()?.navigate('/', { replace: true });
}

//
// * Internal
//

function itemIdOf(path: string): string | undefined {
  const [segment] = path.replace(/^\/+/, '').split(/[/?#]/);

  return segment === undefined || segment === '' ? undefined : decodeURIComponent(segment);
}
