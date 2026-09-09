import { computed } from 'nanostores';

import {
  createPrincipalNameCheck,
  type PrincipalRef,
  type Role,
} from '../../../entities/principal';
import { mergeByKey } from '../../../shared/form';
import { createStepDialogStore, type StepDialogExternal } from '../../../shared/step-dialog';
import { ROLE_EDITOR_STEPS, type RoleEditorStep } from './role-editor-steps';
import {
  initialRoleForm,
  nextRoleForm,
  sameRoleForm,
  validateRoleForm,
  type RoleForm,
  type RoleFormField,
} from './role-form';

export const roleNameCheck = createPrincipalNameCheck('role');

// A name a role already answers to is an error like any other; while the answer is on its way, the name
// holds the later steps back without a message.
const $roleNameExternal = computed(
  roleNameCheck.$state,
  (check): StepDialogExternal<RoleFormField> => ({
    errors: check.status === 'taken' ? { name: 'roles.dialog.nameTaken' } : {},
    busy: check.status === 'pending' ? ['name'] : [],
  }),
);

export const roleEditorDialog = createStepDialogStore<
  RoleEditorStep,
  RoleFormField,
  RoleForm,
  Role
>({
  steps: ROLE_EDITOR_STEPS,
  initialForm: (payload) => initialRoleForm(payload),
  validate: (form, { mode }) => validateRoleForm(form, mode),
  same: sameRoleForm,
  next: nextRoleForm,
  $external: $roleNameExternal,
  reset: roleNameCheck.forget,
});

export const $roleEditor = roleEditorDialog.$state;
export const $roleEditorErrors = roleEditorDialog.$errors;

export const openRoleEditor = roleEditorDialog.open;
export const openRoleEditorAt = roleEditorDialog.openAt;
export const closeRoleEditor = roleEditorDialog.close;
export const markRoleEditorFieldVisited = roleEditorDialog.markVisited;
export const updateRoleEditorForm = roleEditorDialog.update;

/** The members the server holds, which arrive after the dialog opens. */
export function seedRoleEditorMembers(members: readonly PrincipalRef[]): void {
  // The picks made while the read was in flight survive it.
  roleEditorDialog.seed({ members }, (seeded, current) => ({
    members: mergeByKey(seeded.members ?? [], current.members),
  }));
}

/** In the create wizard the display name is also where the name comes from, so it asks the same question. */
export function setRoleEditorDisplayName(displayName: string): void {
  updateRoleEditorForm({ displayName });
  askWhetherNameIsFree();
}

export function setRoleEditorName(name: string, { immediate = false } = {}): void {
  updateRoleEditorForm({ name });
  askWhetherNameIsFree({ immediate });
}

//
// * Internal
//

// Only the create wizard asks: an edit cannot rename, so its name is nobody's to take. A role has no
// provider, so the check is asked with none.
function askWhetherNameIsFree({ immediate = false } = {}): void {
  const { form, mode } = $roleEditor.get();

  if (mode === 'create') {
    roleNameCheck.ask('', form.name, { immediate });
  }
}
