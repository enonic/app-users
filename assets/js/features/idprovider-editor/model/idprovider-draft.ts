import type { PropertyTreeJson } from '@enonic/ui-types';

import type { IdProviderDraft } from '../../../entities/principal';
import type { IdProviderForm } from './idprovider-form';

/**
 * The form as both mutations want it: the same shape, the field the wizard keeps for itself left behind.
 * Trimming stays in the commands. No edit list: a provider has one of each, so the write replaces.
 * `config` is what the save writes for the binding — the applied tree with the form's defaults — and
 * absent keeps what is stored.
 */
export function idProviderDraftFrom(
  form: IdProviderForm,
  config: PropertyTreeJson | undefined = form.config,
): IdProviderDraft {
  return {
    name: form.name,
    displayName: form.displayName,
    description: form.description,
    application: form.application,
    config,
    permissions: form.permissions,
  };
}
