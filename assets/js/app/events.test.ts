import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const connectAdminEvents = vi.hoisted(() => vi.fn());
const subscribeTopic = vi.hoisted(() => vi.fn());
vi.mock('../shared/admin-events', () => ({
  connectAdminEvents,
  subscribeTopic,
}));

import { setConfig } from '../shared/config';
import { startSectionEvents, stopSectionEvents } from './events';

describe('startSectionEvents', () => {
  beforeEach(() => {
    subscribeTopic.mockReturnValue(() => {});
    setConfig({
      appId: 'com.enonic.xp.app.users',
      appVersion: '8.1.0',
      eventsUrl: '/_/admin:events',
    });
  });

  afterEach(() => {
    stopSectionEvents();
    vi.clearAllMocks();
  });

  it('connects to the hub and subscribes the principals topic once', () => {
    startSectionEvents('users');
    startSectionEvents('users');

    expect(connectAdminEvents).toHaveBeenCalledExactlyOnceWith('/_/admin:events');
    expect(subscribeTopic).toHaveBeenCalledExactlyOnceWith(
      'com.enonic.xp.app.settings:principals',
      expect.anything(),
    );
  });

  it('drops the subscription on stop and can start again', () => {
    const unsubscribe = vi.fn();
    subscribeTopic.mockReturnValue(unsubscribe);

    startSectionEvents('users');
    stopSectionEvents();

    expect(unsubscribe).toHaveBeenCalled();

    startSectionEvents('users');
    expect(subscribeTopic).toHaveBeenCalledTimes(2);
  });
});
