import { defineSteps } from '../../../shared/step-dialog';
import type { IdProviderFormField } from './idprovider-form';

export type IdProviderEditorStep = 'general' | 'permissions' | 'summary';

export const ID_PROVIDER_EDITOR_STEPS = defineSteps<IdProviderEditorStep, IdProviderFormField>({
  general: { title: 'idProviders.dialog.general', fields: ['displayName', 'name'] },
  permissions: { title: 'idProviders.dialog.permissions', fields: ['permissions'] },
  summary: { title: 'idProviders.dialog.summary', fields: [] },
});
