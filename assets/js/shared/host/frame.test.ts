import { describe, expect, it, vi } from 'vitest';

import { fakeHost, pathStore, readable } from '../../../../test/mocks/fake-host';
import type { Notification, SectionHost } from '../sections';
import { createHostFrame } from './frame';

describe('$itemId', () => {
  // ! The case a nanostores atom would have hidden: a `Readable` never calls back on subscribe.
  it('reads the path already in place, so a deep link opens its row', () => {
    const frame = createHostFrame(fakeHost({ path: pathStore('/user:store:bob') }));

    expect(frame.$itemId.get()).toBe('user:store:bob');
  });

  it('is undefined at the section root', () => {
    const frame = createHostFrame(fakeHost({ path: pathStore('/') }));

    expect(frame.$itemId.get()).toBeUndefined();
  });

  it('follows a later navigation', () => {
    const path = pathStore('/');
    const frame = createHostFrame(fakeHost({ path }));

    path.set('/role:editors');

    expect(frame.$itemId.get()).toBe('role:editors');
  });

  it('ignores the search params the path carries', () => {
    const frame = createHostFrame(fakeHost({ path: pathStore('/group:store:devs?q=dev') }));

    expect(frame.$itemId.get()).toBe('group:store:devs');
  });

  it('decodes a key that had to be escaped', () => {
    const frame = createHostFrame(
      fakeHost({ path: pathStore(`/${encodeURIComponent('user:store:a b')}`) }),
    );

    expect(frame.$itemId.get()).toBe('user:store:a b');
  });

  it('keeps a segment that does not decode, rather than throwing', () => {
    const path = pathStore('/100%');
    const frame = createHostFrame(fakeHost({ path }));

    expect(frame.$itemId.get()).toBe('100%');

    path.set('/foo%zz');

    expect(frame.$itemId.get()).toBe('foo%zz');
  });

  it('stops following the path once disposed', () => {
    const path = pathStore('/');
    const frame = createHostFrame(fakeHost({ path }));

    frame.dispose();
    path.set('/role:editors');

    expect(frame.$itemId.get()).toBeUndefined();
  });
});

describe('$visible', () => {
  it('mirrors the host, reading the current value before following changes', () => {
    const visible = readable(false);
    const frame = createHostFrame(fakeHost({ visible }));

    expect(frame.$visible.get()).toBe(false);

    visible.set(true);

    expect(frame.$visible.get()).toBe(true);
  });

  it('stops following once disposed', () => {
    const visible = readable(true);
    const frame = createHostFrame(fakeHost({ visible }));
    frame.dispose();

    visible.set(false);

    expect(frame.$visible.get()).toBe(true);
  });
});

describe('navigation', () => {
  it('opens an item by replacing, so browsing rows leaves no history', () => {
    const navigate = vi.fn<SectionHost['navigate']>();
    const frame = createHostFrame(fakeHost({ navigate }));

    frame.openItem('user:store:bob');

    expect(navigate).toHaveBeenCalledWith('/user%3Astore%3Abob', { replace: true });
  });

  it('closes back to the section root', () => {
    const navigate = vi.fn<SectionHost['navigate']>();
    const frame = createHostFrame(fakeHost({ navigate }));

    frame.closeItem();

    expect(navigate).toHaveBeenCalledWith('/', { replace: true });
  });
});

describe('notifications', () => {
  it('hands the message to the host with its level', () => {
    const notify = vi.fn<SectionHost['notify']>(() => () => undefined);
    const frame = createHostFrame(fakeHost({ notify }));

    frame.notify('error', 'It broke');
    frame.notify('success', 'It worked');

    expect(notify).toHaveBeenCalledWith({ level: 'error', message: 'It broke' });
    expect(notify).toHaveBeenCalledWith({ level: 'success', message: 'It worked' });
  });
});

// ! The contract lets the host serve every section of an app from one module instance, so two
// ! mounts must not share anything: this is the test a module-level `$host` fails.
describe('two mounts from one module instance', () => {
  it('keeps their routing and notifications apart', () => {
    const usersPath = pathStore('/user:store:bob');
    const usersNavigate = vi.fn<SectionHost['navigate']>();
    const usersNotify = vi.fn<SectionHost['notify']>(() => () => undefined);
    const rolesPath = pathStore('/');
    const rolesNavigate = vi.fn<SectionHost['navigate']>();

    const users = createHostFrame(
      fakeHost({ path: usersPath, navigate: usersNavigate, notify: usersNotify }),
    );
    const roles = createHostFrame(fakeHost({ path: rolesPath, navigate: rolesNavigate }));

    expect(users.$itemId.get()).toBe('user:store:bob');
    expect(roles.$itemId.get()).toBeUndefined();

    rolesPath.set('/role:editors');
    expect(users.$itemId.get()).toBe('user:store:bob');
    expect(roles.$itemId.get()).toBe('role:editors');

    roles.openItem('role:admin');
    expect(rolesNavigate).toHaveBeenCalledWith('/role%3Aadmin', { replace: true });
    expect(usersNavigate).not.toHaveBeenCalled();

    users.notify('error', 'Only for Users');
    expect(usersNotify).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ message: 'Only for Users' }) as Notification,
    );
  });
});
