import { computed } from 'nanostores';

import {
  $idProviderNames,
  $principalNameCheck,
  checkPrincipalName,
  forgetPrincipalNameChecks,
  type Group,
} from '../../../entities/principal';
import { createStepDialogStore, type StepDialogExternal } from '../../../shared/step-dialog';
import { GROUP_EDITOR_STEPS, type GroupEditorStep } from './group-editor-steps';
import {
  initialGroupForm,
  nextGroupForm,
  sameGroupForm,
  validateGroupForm,
  type GroupForm,
  type GroupFormField,
} from './group-form';

// The name a provider already holds is an error like any other; while the answer is on its way, the name
// holds the later steps back without a message.
const $groupNameExternal = computed(
  $principalNameCheck,
  (check): StepDialogExternal<GroupFormField> => ({
    errors: check.status === 'taken' ? { name: 'groups.dialog.nameTaken' } : {},
    busy: check.status === 'pending' ? ['name'] : [],
  }),
);

export const groupEditorDialog = createStepDialogStore<
  GroupEditorStep,
  GroupFormField,
  GroupForm,
  Group
>({
  steps: GROUP_EDITOR_STEPS,
  initialForm: (payload) => initialGroupForm(payload, onlyProvider()),
  validate: (form, { mode }) => validateGroupForm(form, mode),
  same: sameGroupForm,
  next: nextGroupForm,
  $external: $groupNameExternal,
  reset: forgetPrincipalNameChecks,
});

export const $groupEditor = groupEditorDialog.$state;
export const $groupEditorErrors = groupEditorDialog.$errors;

export const openGroupEditor = groupEditorDialog.open;
export const openGroupEditorAt = groupEditorDialog.openAt;
export const closeGroupEditor = groupEditorDialog.close;
export const markGroupEditorFieldVisited = groupEditorDialog.markVisited;
export const updateGroupEditorForm = groupEditorDialog.update;

/** In the create wizard the display name is also where the name comes from, so it asks the same question. */
export function setGroupEditorDisplayName(displayName: string): void {
  updateGroupEditorForm({ displayName });
  askWhetherNameIsFree();
}

export function setGroupEditorName(name: string, { immediate = false } = {}): void {
  updateGroupEditorForm({ name });
  askWhetherNameIsFree({ immediate });
}

/** The provider the name has to be free in, so a name already typed is asked about again at once. */
export function setGroupEditorIdProvider(idProvider: string): void {
  updateGroupEditorForm({ idProvider });
  askWhetherNameIsFree({ immediate: true });
}

//
// * Internal
//

// Only the create wizard asks: an edit cannot rename, so its name is nobody's to take.
function askWhetherNameIsFree({ immediate = false } = {}): void {
  const { form, mode } = $groupEditor.get();

  if (mode === 'create') {
    checkPrincipalName('group', form.idProvider, form.name, { immediate });
  }
}

// Where a create starts: the one provider there is, otherwise none.
function onlyProvider(): string {
  const { items } = $idProviderNames.get();

  return items.length === 1 ? (items[0]?.key ?? '') : '';
}
