import type { ResultAsync } from 'neverthrow';

import type { AppError } from '../../../shared/api';

export type RowLoaderOptions<T> = {
  fetch: (key: string, signal: AbortSignal) => ResultAsync<T | undefined, AppError>;
  receive: (row: T) => void;
  /** The key names nothing the caller may read: deleted meanwhile, or behind a provider's ACL. */
  missing?: (key: string) => void;
};

/**
 * Re-reads one row the hub said changed, one request per key at a time.
 * ! A failed read leaves the row as it was and says nothing: nobody asked for this load, so the list must
 * ! not flip to `error` over it, and a load failure is never a notification.
 */
export function createRowLoader<T>({
  fetch,
  receive,
  missing,
}: RowLoaderOptions<T>): (key: string) => Promise<void> {
  const pending = new Map<string, AbortController>();

  return function load(key: string): Promise<void> {
    pending.get(key)?.abort();
    const controller = new AbortController();
    pending.set(key, controller);
    const { signal } = controller;

    return fetch(key, signal)
      .match(
        (row) => {
          if (signal.aborted) {
            return;
          }
          if (row === undefined) {
            missing?.(key);
          } else {
            receive(row);
          }
        },
        () => undefined,
      )
      .finally(() => {
        if (pending.get(key) === controller) {
          pending.delete(key);
        }
      });
  };
}
