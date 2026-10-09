import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const connectAdminEvents = vi.hoisted(() => vi.fn());
const subscribeTopic = vi.hoisted(() => vi.fn());
vi.mock('../shared/admin-events/admin-events', () => ({ connectAdminEvents, subscribeTopic }));

import { fakeHost } from '../../../test/mocks/fake-host';
import { setConfig } from '../shared/config';
import { createHostFrame } from '../shared/host';
import { startSectionEvents, stopSectionEvents } from './events';
import { SECTIONS } from './section';

const frame = createHostFrame(fakeHost());

describe('startSectionEvents', () => {
  beforeEach(() => {
    subscribeTopic.mockReturnValue(() => {});
    setConfig({
      appId: 'com.enonic.xp.app.users',
      appVersion: '8.1.0',
      eventsUrl: '/_/admin:events',
      readOnlyMode: false,
    });
  });

  afterEach(() => {
    SECTIONS.forEach(stopSectionEvents);
    vi.clearAllMocks();
  });

  it('connects to the hub and subscribes each topic once', () => {
    startSectionEvents('users', frame);
    startSectionEvents('users', frame);

    expect(connectAdminEvents).toHaveBeenCalledWith('/_/admin:events');
    expect(subscribeTopic.mock.calls.map(([topic]) => topic)).toEqual([
      'com.enonic.xp.app.settings:principals',
      'com.enonic.xp.app.settings:applications',
    ]);
  });

  // A provider's mode is its application's, so a section gating on it follows the lifecycle too.
  it('leaves the applications topic to the sections that gate on a mode', () => {
    startSectionEvents('roles', frame);
    startSectionEvents('service-accounts', frame);

    expect(subscribeTopic.mock.calls.map(([topic]) => topic)).not.toContain(
      'com.enonic.xp.app.settings:applications',
    );
  });

  it('drops the subscription on stop and can start again', () => {
    const unsubscribe = vi.fn();
    subscribeTopic.mockReturnValue(unsubscribe);

    startSectionEvents('users', frame);
    stopSectionEvents('users');

    expect(unsubscribe).toHaveBeenCalled();

    startSectionEvents('users', frame);
    expect(subscribeTopic).toHaveBeenCalledTimes(4);
  });

  // ! One module instance can serve several mounted sections: each holds its own subscription, and
  // ! stopping one section must not silence another.
  it('keeps each mounted section on its own subscription', () => {
    const dropUsers = vi.fn();
    const dropRoles = vi.fn();
    subscribeTopic
      .mockReturnValueOnce(dropUsers)
      .mockReturnValueOnce(dropUsers)
      .mockReturnValueOnce(dropRoles);

    startSectionEvents('users', frame);
    startSectionEvents('roles', frame);

    expect(subscribeTopic).toHaveBeenCalledTimes(3);

    stopSectionEvents('users');

    expect(dropUsers).toHaveBeenCalled();
    expect(dropRoles).not.toHaveBeenCalled();
  });
});
