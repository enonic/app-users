import { defineSteps } from '../../../shared/step-dialog';
import type { IdProviderFormField } from './idprovider-form';

export type IdProviderEditorStep = 'identity' | 'permissions' | 'summary';

export const ID_PROVIDER_EDITOR_STEPS = defineSteps<IdProviderEditorStep, IdProviderFormField>({
  identity: { title: 'idProviders.dialog.identity', fields: ['displayName', 'name'] },
  permissions: { title: 'idProviders.dialog.permissions', fields: ['permissions'] },
  summary: { title: 'idProviders.dialog.summary', fields: [] },
});
