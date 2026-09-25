import { Form } from '@enonic/input-types/schema';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { whenIdProviderConfigSettled } from './idprovider-config-settled';
import {
  beginIdProviderConfigLoad,
  clearIdProviderConfig,
  failIdProviderConfigLoad,
  receiveIdProviderConfig,
} from './idprovider-config.store';

const APP = 'com.example.oidc';
const FORM = Form.fromJson([], APP);

afterEach(() => {
  clearIdProviderConfig();
  vi.useRealTimers();
});

describe('whenIdProviderConfigSettled', () => {
  it('answers at once when the snapshot already has the application', async () => {
    receiveIdProviderConfig(APP, FORM, []);

    await expect(whenIdProviderConfigSettled(APP)).resolves.toMatchObject({ status: 'ready' });
  });

  it('answers at once with no application to wait for', async () => {
    await expect(whenIdProviderConfigSettled('')).resolves.toEqual({ status: 'idle' });
  });

  it('waits for the form on its way, and answers with it', async () => {
    beginIdProviderConfigLoad(APP);
    const settled = whenIdProviderConfigSettled(APP);

    receiveIdProviderConfig(APP, FORM, []);

    await expect(settled).resolves.toMatchObject({ status: 'ready', application: APP });
  });

  it('waits through a load that has not started yet, and a failure settles it too', async () => {
    const settled = whenIdProviderConfigSettled(APP);

    beginIdProviderConfigLoad(APP);
    failIdProviderConfigLoad(APP);

    await expect(settled).resolves.toEqual({ status: 'error', application: APP });
  });

  it('does not take another application’s answer for this one', async () => {
    vi.useFakeTimers();
    beginIdProviderConfigLoad(APP);
    const settled = whenIdProviderConfigSettled(APP, 1_000);
    let answered = false;
    void settled.then(() => {
      answered = true;
    });

    receiveIdProviderConfig('com.example.ldap', FORM, []);
    await vi.advanceTimersByTimeAsync(0);

    expect(answered).toBe(false);
  });

  it('gives up after the timeout with whatever the snapshot holds', async () => {
    vi.useFakeTimers();
    beginIdProviderConfigLoad(APP);
    const settled = whenIdProviderConfigSettled(APP, 1_000);

    await vi.advanceTimersByTimeAsync(1_000);

    await expect(settled).resolves.toEqual({ status: 'loading', application: APP });
  });
});
