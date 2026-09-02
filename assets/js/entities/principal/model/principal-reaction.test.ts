import { atom } from 'nanostores';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrincipalsMessage, TopicHandlers } from '../../../shared/admin-events';
import { setPhrases } from '../../../shared/i18n';
import { createSelectionStore } from '../../../shared/selection';

const subscribeTopic = vi.hoisted(() => vi.fn());
vi.mock('../../../shared/admin-events/admin-events', () => ({ subscribeTopic }));

import { createPrincipalReaction, type PrincipalReactionOptions } from './principal-reaction';

const WINDOW_MS = 300;
const ALICE = 'user:system:alice';
const BOB = 'user:system:bob';

function hub(): TopicHandlers {
  const handlers = subscribeTopic.mock.calls[0]?.[1] as TopicHandlers | undefined;
  if (handlers === undefined) {
    throw new Error('nothing subscribed');
  }
  return handlers;
}

function arrives(operation: PrincipalsMessage['operation'], kind: string, ...keys: string[]): void {
  keys.forEach((key) => hub().onMessage({ operation, changes: [{ kind, key }] }));
}

function settle(): Promise<void> {
  vi.advanceTimersByTime(WINDOW_MS);
  return vi.runAllTimersAsync().then(() => undefined);
}

function setup(overrides: Partial<PrincipalReactionOptions> = {}) {
  const selection = createSelectionStore();
  const scope = {
    $visible: atom(true),
    activeKey: vi.fn<() => string | undefined>(() => ALICE),
    closeItem: vi.fn(),
    notify: vi.fn(),
    selection,
  };
  const options = {
    kind: 'user' as const,
    scope,
    loadRow: vi.fn(() => Promise.resolve()),
    removeRow: vi.fn(),
    evictDetail: vi.fn(),
    refresh: vi.fn(),
    onCreated: 'refresh' as const,
    foreign: vi.fn(() => false),
    ...overrides,
  };

  subscribeTopic.mockReturnValue(() => {});
  createPrincipalReaction(options).start();

  return { ...options, scope, selection };
}

beforeEach(() => {
  vi.useFakeTimers();
  setPhrases({ 'principal.notify.deletedElsewhere': '"{0}" has been deleted' }, 'en');
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('createPrincipalReaction', () => {
  it('re-reads the one row that changed and leaves the open panel alone', async () => {
    const { loadRow, evictDetail, refresh, scope } = setup();

    arrives('updated', 'user', BOB);
    await settle();

    expect(loadRow).toHaveBeenCalledExactlyOnceWith(BOB);
    expect(evictDetail).toHaveBeenCalledExactlyOnceWith(BOB);
    expect(refresh).not.toHaveBeenCalled();
    expect(scope.closeItem).not.toHaveBeenCalled();
    expect(scope.notify).not.toHaveBeenCalled();
  });

  it('re-reads the open panel when it is the row that changed', async () => {
    const { loadRow, evictDetail } = setup();

    arrives('updated', 'user', ALICE);
    await settle();

    expect(loadRow).toHaveBeenCalledExactlyOnceWith(ALICE);
    expect(evictDetail).toHaveBeenCalledExactlyOnceWith(ALICE);
  });

  it('removes a deleted row without a request, and its tick with it', async () => {
    const { loadRow, removeRow, refresh, scope, selection } = setup();
    selection.toggle(BOB, true);

    arrives('deleted', 'user', BOB);
    await settle();

    expect(removeRow).toHaveBeenCalledExactlyOnceWith(BOB);
    expect(selection.$selected.get().has(BOB)).toBe(false);
    expect(loadRow).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(scope.closeItem).not.toHaveBeenCalled();
    expect(scope.notify).not.toHaveBeenCalled();
  });

  it('closes the panel showing a deleted principal and says so', async () => {
    const { scope } = setup();

    arrives('deleted', 'user', ALICE);
    await settle();

    expect(scope.closeItem).toHaveBeenCalledTimes(1);
    expect(scope.notify).toHaveBeenCalledExactlyOnceWith(expect.stringContaining('alice'));
  });

  it('re-reads the screen for a new row it cannot place', async () => {
    const { loadRow, refresh } = setup({ onCreated: 'refresh' });

    arrives('created', 'user', BOB);
    await settle();

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(loadRow).not.toHaveBeenCalled();
  });

  it('takes a new row into a list loaded whole', async () => {
    const { loadRow, refresh } = setup({ onCreated: 'load' });

    arrives('created', 'user', BOB);
    await settle();

    expect(loadRow).toHaveBeenCalledExactlyOnceWith(BOB);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('answers a burst too large to patch with one re-read', async () => {
    const { loadRow, refresh } = setup();
    const keys = Array.from({ length: 11 }, (_, i) => `user:system:u${i}`);

    arrives('updated', 'user', ...keys);
    await settle();

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(loadRow).not.toHaveBeenCalled();
  });

  it('hands the other kinds to the section, and re-reads when it asks', async () => {
    const foreign = vi.fn(() => true);
    const { loadRow, refresh } = setup({ foreign });

    arrives('updated', 'group', 'group:system:devs');
    arrives('updated', 'user', BOB);
    await settle();

    expect(foreign).toHaveBeenCalledExactlyOnceWith([
      { kind: 'group', key: 'group:system:devs', operation: 'updated' },
    ]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(loadRow).not.toHaveBeenCalled();
  });

  it('still removes deleted rows on the way to a re-read', async () => {
    const { removeRow, refresh } = setup({ foreign: () => true });

    arrives('deleted', 'user', BOB);
    await settle();

    expect(removeRow).toHaveBeenCalledExactlyOnceWith(BOB);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
