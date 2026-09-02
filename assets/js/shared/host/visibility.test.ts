import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { observeVisibility } from './visibility';

// No DOM under vitest: `IntersectionObserver` and `ShadowRoot` are stood in for.
type Callback = (entries: { isIntersecting: boolean }[]) => void;

class FakeShadowRoot {
  constructor(public host: object) {}
}

const observed: object[] = [];
let callback: Callback | undefined;

class FakeIntersectionObserver {
  constructor(cb: Callback) {
    callback = cb;
  }
  observe(target: object): void {
    observed.push(target);
  }
  disconnect = vi.fn();
}

function shadowHosted() {
  const host = { name: 'shadow host' };
  const root = new FakeShadowRoot(host);
  const container = { name: 'container', getRootNode: () => root };
  return { host, container: container as unknown as Element };
}

function plain() {
  const container = { name: 'container', getRootNode: () => document_ };
  return container as unknown as Element;
}

const document_ = { name: 'document' };

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  vi.stubGlobal('ShadowRoot', FakeShadowRoot);
  observed.length = 0;
  callback = undefined;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('observeVisibility', () => {
  // The container is a boxless `display: contents` wrapper; observing it left every section hidden for good.
  it('watches the shadow host, not the boxless container inside it', () => {
    const { host, container } = shadowHosted();

    observeVisibility(container);

    expect(observed).toEqual([host]);
  });

  it('watches the container itself when it is in the document', () => {
    const container = plain();

    observeVisibility(container);

    expect(observed).toEqual([container]);
  });

  it('starts visible and follows what the observer reports', () => {
    const { $visible } = observeVisibility(shadowHosted().container);
    expect($visible.get()).toBe(true);

    callback?.([{ isIntersecting: false }]);
    expect($visible.get()).toBe(false);

    callback?.([{ isIntersecting: false }, { isIntersecting: true }]);
    expect($visible.get()).toBe(true);
  });

  it('counts as visible where there is no observer to ask', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    const { $visible } = observeVisibility(shadowHosted().container);

    expect($visible.get()).toBe(true);
    expect(observed).toEqual([]);
  });
});
