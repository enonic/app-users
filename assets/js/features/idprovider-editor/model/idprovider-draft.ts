import type { IdProviderDraft } from '../../../entities/principal';
import type { IdProviderForm } from './idprovider-form';

/**
 * The form as both mutations want it: the same shape, the field the wizard keeps for itself left behind.
 * Trimming stays in the commands. No edit list: a provider has one of each, so the write replaces.
 */
export function idProviderDraftFrom(form: IdProviderForm): IdProviderDraft {
  return {
    name: form.name,
    displayName: form.displayName,
    description: form.description,
    application: form.application,
    permissions: form.permissions,
  };
}
