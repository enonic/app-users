import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const connectAdminEvents = vi.hoisted(() => vi.fn());
const subscribeTopic = vi.hoisted(() => vi.fn());
vi.mock('../shared/admin-events', () => ({
  connectAdminEvents,
  subscribeTopic,
}));

import { setConfig } from '../shared/config';
import { startSectionEvents, stopSectionEvents } from './events';
import { SECTIONS } from './section';

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
    SECTIONS.forEach(stopSectionEvents);
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
    stopSectionEvents('users');

    expect(unsubscribe).toHaveBeenCalled();

    startSectionEvents('users');
    expect(subscribeTopic).toHaveBeenCalledTimes(2);
  });

  // ! One module instance can serve several mounted sections: each holds its own subscription, and
  // ! stopping one section must not silence another.
  it('keeps each mounted section on its own subscription', () => {
    const dropUsers = vi.fn();
    const dropRoles = vi.fn();
    subscribeTopic.mockReturnValueOnce(dropUsers).mockReturnValueOnce(dropRoles);

    startSectionEvents('users');
    startSectionEvents('roles');

    expect(subscribeTopic).toHaveBeenCalledTimes(2);

    stopSectionEvents('users');

    expect(dropUsers).toHaveBeenCalled();
    expect(dropRoles).not.toHaveBeenCalled();
  });
});
