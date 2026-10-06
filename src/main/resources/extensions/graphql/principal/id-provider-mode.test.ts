import { getIdProviderDescriptor } from '/lib/idprovider';
import type { IdProvider } from '/lib/xp/auth';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { allowsWrite, idProviderModeOf, type IdProviderMode } from './id-provider-mode';

const BOUND = {
  key: 'remote',
  displayName: 'Remote',
  idProviderConfig: { applicationKey: 'com.example.remote', config: {} },
} as IdProvider;

afterEach(() => {
  vi.resetAllMocks();
});

describe('idProviderModeOf', () => {
  it('reads a provider bound to nothing as LOCAL, without asking for a descriptor', () => {
    expect(idProviderModeOf({ key: 'system', displayName: 'System' } as IdProvider)).toBe('LOCAL');

    expect(vi.mocked(getIdProviderDescriptor)).not.toHaveBeenCalled();
  });

  it("takes the bound application's own mode", () => {
    vi.mocked(getIdProviderDescriptor).mockReturnValue({ mode: 'MIXED', hasConfig: false });

    expect(idProviderModeOf(BOUND)).toBe('MIXED');
    expect(vi.mocked(getIdProviderDescriptor)).toHaveBeenCalledWith({
      application: 'com.example.remote',
    });
  });

  it('reads a descriptor that declares no mode as LOCAL', () => {
    vi.mocked(getIdProviderDescriptor).mockReturnValue({ hasConfig: false });

    expect(idProviderModeOf(BOUND)).toBe('LOCAL');
  });

  it('answers UNAVAILABLE when the bound application ships no descriptor', () => {
    vi.mocked(getIdProviderDescriptor).mockReturnValue(null);

    expect(idProviderModeOf(BOUND)).toBe('UNAVAILABLE');
  });

  it('reads a mode it does not know as EXTERNAL', () => {
    vi.mocked(getIdProviderDescriptor).mockReturnValue({ mode: 'FEDERATED', hasConfig: false });

    expect(idProviderModeOf(BOUND)).toBe('EXTERNAL');
  });
});

describe('allowsWrite', () => {
  const MODES: IdProviderMode[] = ['LOCAL', 'MIXED', 'EXTERNAL', 'UNAVAILABLE'];

  it('allows user writes under LOCAL alone', () => {
    expect(MODES.filter((mode) => allowsWrite(mode, 'user'))).toEqual(['LOCAL']);
  });

  it('allows group writes under LOCAL and MIXED', () => {
    expect(MODES.filter((mode) => allowsWrite(mode, 'group'))).toEqual(['LOCAL', 'MIXED']);
  });
});
