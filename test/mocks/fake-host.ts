import { atom } from 'nanostores';
import { vi } from 'vitest';

import type { Host, Notification, Readable } from '../../assets/js/shared/sections';

/**
 * ! `path` does not call back on subscribe, unlike `theme` — a nanostores atom does, so using one
 * ! here would hide every bug that reading the current value at mount is what prevents.
 */
export function pathStore(initial: string): Readable<string> & { set(value: string): void } {
  let current = initial;
  const listeners = new Set<(v: string) => void>();

  return {
    get: () => current,
    set(value: string) {
      current = value;
      for (const listener of listeners) {
        listener(value);
      }
    },
    subscribe(callback: (v: string) => void) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}

/** Everything the host was asked to show, in order, so a command can be tested by what it said. */
export const notified: Notification[] = [];

/**
 * A stand-in for the object the shell hands to `mount`. Only what a test drives is real; the rest
 * answers plausibly so nothing has to be stubbed twice.
 */
export function fakeHost(overrides: Partial<Host> = {}): Host {
  return {
    baseUrl: '/admin/tool/_/admin:extension/app:users',
    locale: 'en',
    theme: atom<'light' | 'dark'>('light'),
    path: pathStore('/'),
    navigate: vi.fn(),
    url: (subPath: string) => `#${subPath}`,
    notify: vi.fn((notification: Notification) => {
      notified.push(notification);
      return () => undefined;
    }),
    ...overrides,
  };
}

export function forgetNotifications(): void {
  notified.length = 0;
}
