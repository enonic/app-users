import { Form } from '@enonic/input-types/schema';
import type { FormJson, PropertyTreeJson } from '@enonic/ui-types';
import { describe, expect, it } from 'vitest';

import {
  effectiveIdProviderConfig,
  writesIdProviderConfig,
  type IdProviderBinding,
} from './idprovider-config-effective';
import type { IdProviderConfigState } from './idprovider-config.store';

const APP = 'com.example.oidc';

const FORM_JSON: FormJson = [
  {
    formItemType: 'Input',
    name: 'clientId',
    label: 'Client ID',
    inputType: 'TextLine',
    occurrences: { minimum: 1, maximum: 1 },
    config: {},
  },
  {
    formItemType: 'Input',
    name: 'sessionTimeout',
    label: 'Session timeout',
    inputType: 'Long',
    occurrences: { minimum: 0, maximum: 1 },
    config: { default: 30 },
  },
];

const FILLED = [{ name: 'clientId', type: 'String' as const, values: [{ v: 'intranet' }] }];

function ready(stored = FILLED, application = APP): IdProviderConfigState {
  return { status: 'ready', application, form: Form.fromJson(FORM_JSON, application), stored };
}

function created(applied?: PropertyTreeJson): IdProviderBinding {
  return { application: APP, applied, bound: '' };
}

describe('effectiveIdProviderConfig', () => {
  it('writes the stored configuration with the defaults the form fills in', () => {
    expect(effectiveIdProviderConfig(ready(), created())).toEqual([
      { name: 'clientId', type: 'String', values: [{ v: 'intranet' }] },
      { name: 'sessionTimeout', type: 'Long', values: [{ v: 30 }] },
    ]);
  });

  it('writes what the dialog applied in place of what is stored', () => {
    const applied = [{ name: 'clientId', type: 'String' as const, values: [{ v: 'portal' }] }];

    expect(effectiveIdProviderConfig(ready(), created(applied))?.[0]).toEqual(applied[0]);
  });

  it('writes an edit that binds another application from that form', () => {
    const rebound = { application: APP, applied: undefined, bound: 'com.example.ldap' };

    expect(effectiveIdProviderConfig(ready([]), rebound)).toContainEqual({
      name: 'sessionTimeout',
      type: 'Long',
      values: [{ v: 30 }],
    });
  });

  it('keeps what is stored on an edit that neither rebinds nor applies', () => {
    expect(
      effectiveIdProviderConfig(ready(), { application: APP, applied: undefined, bound: APP }),
    ).toBeUndefined();
  });

  it.each<[string, IdProviderConfigState]>([
    ['the application has no form', { status: 'absent', application: APP }],
    ['the form could not be read', { status: 'error', application: APP }],
    ['the form is still on its way', { status: 'loading', application: APP }],
    ['the form is for another application', ready(FILLED, 'com.example.ldap')],
  ])('keeps what is stored when %s', (_, state) => {
    expect(effectiveIdProviderConfig(state, created(FILLED))).toBeUndefined();
  });
});

describe('writesIdProviderConfig', () => {
  it.each<[string, IdProviderBinding, boolean]>([
    ['a create that binds an application', created(), true],
    [
      'an edit that binds another application',
      { application: APP, applied: undefined, bound: 'com.example.ldap' },
      true,
    ],
    [
      'an edit that applies a configuration',
      { application: APP, applied: FILLED, bound: APP },
      true,
    ],
    [
      'an edit that keeps its binding and applies nothing',
      { application: APP, applied: undefined, bound: APP },
      false,
    ],
    ['a provider bound to nothing', { application: '', applied: undefined, bound: '' }, false],
  ])('answers for %s', (_, binding, writes) => {
    expect(writesIdProviderConfig(binding)).toBe(writes);
  });
});
