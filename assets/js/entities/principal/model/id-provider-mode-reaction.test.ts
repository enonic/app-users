import { atom } from 'nanostores';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HUB_TOPICS, type TopicHandlers } from '../../../shared/admin-events';

const subscribeTopic = vi.hoisted(() => vi.fn());
vi.mock('../../../shared/admin-events/admin-events', () => ({ subscribeTopic }));

import { createIdProviderModeReaction } from './id-provider-mode-reaction';

const WINDOW_MS = 300;

function hub(): TopicHandlers {
  const handlers = subscribeTopic.mock.calls[0]?.[1] as TopicHandlers | undefined;
  if (handlers === undefined) {
    throw new Error('nothing subscribed');
  }
  return handlers;
}

function setup() {
  const refresh = vi.fn();
  const unsubscribe = vi.fn();
  subscribeTopic.mockReturnValue(unsubscribe);

  const reaction = createIdProviderModeReaction(atom(true), refresh);
  reaction.start();

  return { refresh, unsubscribe, reaction };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('createIdProviderModeReaction', () => {
  it('listens on the applications topic', () => {
    setup();

    expect(subscribeTopic).toHaveBeenCalledWith(HUB_TOPICS.applications, expect.anything());
  });

  it('re-reads the screen once an application has stopped, whichever application it was', () => {
    const { refresh } = setup();

    hub().onMessage({ eventType: 'STOPPED', key: 'com.example.remote' });

    expect(refresh).not.toHaveBeenCalled();

    vi.advanceTimersByTime(WINDOW_MS);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('ignores a message that is not an application lifecycle event', () => {
    const { refresh } = setup();

    hub().onMessage({ eventType: 'STOPPED' });
    hub().onMessage({ eventType: 'EXPLODED', key: 'com.example.remote' });
    hub().onMessage('STOPPED');

    vi.advanceTimersByTime(WINDOW_MS);

    expect(refresh).not.toHaveBeenCalled();
  });

  it('unsubscribes on stop, and lets nothing gathered through afterwards', () => {
    const { refresh, unsubscribe, reaction } = setup();

    hub().onMessage({ eventType: 'STARTED', key: 'com.example.remote' });
    reaction.stop();

    expect(unsubscribe).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(WINDOW_MS);

    expect(refresh).not.toHaveBeenCalled();
  });
});
