import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fakeHost, pathStore } from '../../../../test/mocks/fake-host';
import type { Host } from '../sections';
import { setHost } from './host.store';
import { $itemId, closeItem, openItem } from './routing';

let path: ReturnType<typeof pathStore>;
let navigate: Host['navigate'];

beforeEach(() => {
  path = pathStore('/');
  navigate = vi.fn<Host['navigate']>();
  setHost(fakeHost({ path, navigate }));
});

describe('$itemId', () => {
  // ! The case a nanostores atom would have hidden: `path` does not call back on subscribe.
  it('reads the path already in place, so a deep link opens its row', () => {
    path = pathStore('/user:store:bob');
    setHost(fakeHost({ path }));

    expect($itemId.get()).toBe('user:store:bob');
  });

  it('is undefined at the section root', () => {
    expect($itemId.get()).toBeUndefined();
  });

  it('follows a later navigation', () => {
    path.set('/role:editors');

    expect($itemId.get()).toBe('role:editors');
  });

  it('ignores the search params the path carries', () => {
    path = pathStore('/group:store:devs?q=dev');
    setHost(fakeHost({ path }));

    expect($itemId.get()).toBe('group:store:devs');
  });

  it('decodes a key that had to be escaped', () => {
    path = pathStore(`/${encodeURIComponent('user:store:a b')}`);
    setHost(fakeHost({ path }));

    expect($itemId.get()).toBe('user:store:a b');
  });
});

describe('navigation', () => {
  it('opens an item by replacing, so browsing rows leaves no history', () => {
    openItem('user:store:bob');

    expect(vi.mocked(navigate)).toHaveBeenCalledWith('/user%3Astore%3Abob', { replace: true });
  });

  it('closes back to the section root', () => {
    closeItem();

    expect(vi.mocked(navigate)).toHaveBeenCalledWith('/', { replace: true });
  });
});
