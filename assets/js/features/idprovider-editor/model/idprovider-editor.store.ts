import { computed } from 'nanostores';

import {
  $principalNameCheck,
  checkPrincipalName,
  forgetPrincipalNameChecks,
  type IdProvider,
  type IdProviderPermission,
} from '../../../entities/principal';
import { createStepDialogStore, type StepDialogExternal } from '../../../shared/step-dialog';
import { ID_PROVIDER_EDITOR_STEPS, type IdProviderEditorStep } from './idprovider-editor-steps';
import {
  initialIdProviderForm,
  mergePermissions,
  nextIdProviderForm,
  sameIdProviderForm,
  validateIdProviderForm,
  type IdProviderForm,
  type IdProviderFormField,
} from './idprovider-form';

// A name a provider already answers to is an error like any other; while the answer is on its way, the
// name holds the later steps back without a message.
const $idProviderNameExternal = computed(
  $principalNameCheck,
  (check): StepDialogExternal<IdProviderFormField> => ({
    errors: check.status === 'taken' ? { name: 'idProviders.dialog.nameTaken' } : {},
    busy: check.status === 'pending' ? ['name'] : [],
  }),
);

export const idProviderEditorDialog = createStepDialogStore<
  IdProviderEditorStep,
  IdProviderFormField,
  IdProviderForm,
  IdProvider
>({
  steps: ID_PROVIDER_EDITOR_STEPS,
  initialForm: (payload) => initialIdProviderForm(payload),
  validate: (form, { mode }) => validateIdProviderForm(form, mode),
  same: sameIdProviderForm,
  next: nextIdProviderForm,
  $external: $idProviderNameExternal,
  reset: forgetPrincipalNameChecks,
});

export const $idProviderEditor = idProviderEditorDialog.$state;
export const $idProviderEditorErrors = idProviderEditorDialog.$errors;

export const openIdProviderEditor = idProviderEditorDialog.open;
export const openIdProviderEditorAt = idProviderEditorDialog.openAt;
export const closeIdProviderEditor = idProviderEditorDialog.close;
export const markIdProviderEditorFieldVisited = idProviderEditorDialog.markVisited;
export const updateIdProviderEditorForm = idProviderEditorDialog.update;

/**
 * The permissions the wizard starts from, which arrive after it opens: the provider's own list on an edit,
 * the platform's defaults on a create. Once per open — the first answer is the baseline.
 */
export function seedIdProviderEditorPermissions(
  permissions: readonly IdProviderPermission[],
): void {
  // The picks made while the read was in flight survive it.
  idProviderEditorDialog.seed({ permissions }, (seeded, current) => ({
    permissions: mergePermissions(seeded.permissions ?? [], current.permissions),
  }));
}

/** In the create wizard the display name is also where the name comes from, so it asks the same question. */
export function setIdProviderEditorDisplayName(displayName: string): void {
  updateIdProviderEditorForm({ displayName });
  askWhetherNameIsFree();
}

export function setIdProviderEditorName(name: string, { immediate = false } = {}): void {
  updateIdProviderEditorForm({ name });
  askWhetherNameIsFree({ immediate });
}

//
// * Internal
//

// Only the create wizard asks: an edit cannot rename, so its name is nobody's to take. A provider sits
// inside no provider, hence the empty scope.
function askWhetherNameIsFree({ immediate = false } = {}): void {
  const { form, mode } = $idProviderEditor.get();

  if (mode === 'create') {
    checkPrincipalName('idProvider', '', form.name, { immediate });
  }
}
