import { atom } from 'nanostores';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TopicHandlers } from './admin-events';

const subscribeTopic = vi.hoisted(() => vi.fn());
vi.mock('./admin-events', () => ({ subscribeTopic }));

import { createTopicReaction } from './topic-reaction';

const WINDOW_MS = 300;

function hub(): TopicHandlers {
  const handlers = subscribeTopic.mock.calls[0]?.[1] as TopicHandlers | undefined;
  if (handlers === undefined) {
    throw new Error('nothing subscribed');
  }
  return handlers;
}

function setup(visible = true) {
  const $visible = atom(visible);
  const apply = vi.fn();
  const refresh = vi.fn();
  const unsubscribe = vi.fn();
  subscribeTopic.mockReturnValue(unsubscribe);

  const reaction = createTopicReaction<string>({
    topic: 'topic',
    parse: (data) => (typeof data === 'string' ? data : undefined),
    $visible,
    apply,
    refresh,
  });
  reaction.start();

  return { $visible, apply, refresh, unsubscribe, reaction };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('createTopicReaction', () => {
  it('gathers a burst into one batch, in arrival order', () => {
    const { apply } = setup();

    hub().onMessage('a');
    hub().onMessage(42);
    hub().onMessage('b');

    expect(apply).not.toHaveBeenCalled();

    vi.advanceTimersByTime(WINDOW_MS);

    expect(apply).toHaveBeenCalledExactlyOnceWith(['a', 'b']);
  });

  it('refreshes on a loss instead of guessing what was missed', () => {
    const { refresh, apply } = setup();

    hub().onLoss?.(null);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(apply).not.toHaveBeenCalled();
  });

  it('drops what arrives while hidden and refreshes once on reveal', () => {
    const { $visible, apply, refresh } = setup(false);

    hub().onMessage('a');
    hub().onMessage('b');
    hub().onLoss?.(3);
    vi.advanceTimersByTime(WINDOW_MS);

    expect(apply).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();

    $visible.set(true);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('does not refresh a reveal nothing happened during', () => {
    const { $visible, refresh } = setup(false);

    $visible.set(true);

    expect(refresh).not.toHaveBeenCalled();
  });

  it('lets a hide take the open window with it and re-reads on reveal instead', () => {
    const { $visible, apply, refresh } = setup();

    hub().onMessage('a');
    $visible.set(false);
    vi.advanceTimersByTime(WINDOW_MS);

    expect(apply).not.toHaveBeenCalled();

    $visible.set(true);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('stops cleanly: the subscription goes and a pending window never applies', () => {
    const { apply, unsubscribe, reaction } = setup();

    hub().onMessage('a');
    reaction.stop();
    vi.advanceTimersByTime(WINDOW_MS);

    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(apply).not.toHaveBeenCalled();
  });

  it('subscribes once however often it is started', () => {
    const { reaction } = setup();

    reaction.start();

    expect(subscribeTopic).toHaveBeenCalledTimes(1);
  });
});
