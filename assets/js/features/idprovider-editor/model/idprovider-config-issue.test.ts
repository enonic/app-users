import { Form } from '@enonic/input-types/schema';
import type { FormJson } from '@enonic/ui-types';
import { describe, expect, it } from 'vitest';

import { idProviderConfigIssue } from './idprovider-config-issue';
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
];

const FILLED = [{ name: 'clientId', type: 'String' as const, values: [{ v: 'intranet' }] }];

function ready(stored: typeof FILLED | [] = FILLED, application = APP): IdProviderConfigState {
  return { status: 'ready', application, form: Form.fromJson(FORM_JSON, application), stored };
}

describe('idProviderConfigIssue', () => {
  it('reports a stored configuration that leaves a required input empty', () => {
    expect(idProviderConfigIssue(ready([]), APP, undefined)).toBe(
      'idProviders.dialog.configIncomplete',
    );
  });

  it('reports nothing for a stored configuration that fills the form', () => {
    expect(idProviderConfigIssue(ready(), APP, undefined)).toBeUndefined();
  });

  it('judges what the dialog applied over what is stored', () => {
    expect(idProviderConfigIssue(ready([]), APP, FILLED)).toBeUndefined();
    expect(idProviderConfigIssue(ready(), APP, [])).toBe('idProviders.dialog.configIncomplete');
  });

  it('reports a form that could not be read', () => {
    expect(idProviderConfigIssue({ status: 'error', application: APP }, APP, undefined)).toBe(
      'idProviders.dialog.configFailed',
    );
  });

  it.each<[string, IdProviderConfigState, string]>([
    ['nothing is bound', ready([]), ''],
    ['nothing was asked yet', { status: 'idle' }, APP],
    ['the form is on its way', { status: 'loading', application: APP }, APP],
    ['the application has no form', { status: 'absent', application: APP }, APP],
    ['what is loaded is another application', ready([], 'com.example.ldap'), APP],
  ])('reports nothing while %s', (_, state, application) => {
    expect(idProviderConfigIssue(state, application, undefined)).toBeUndefined();
  });
});
