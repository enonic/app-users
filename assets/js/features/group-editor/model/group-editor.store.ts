import { computed } from 'nanostores';

import {
  $idProviderModeByKey,
  $idProviderNames,
  allowsWrite,
  idProviderOf,
  createPrincipalNameCheck,
  type Group,
  type IdProviderMode,
  type IdProviderName,
  type PrincipalRef,
} from '../../../entities/principal';
import { mergeByKey } from '../../../shared/form';
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

export const groupNameCheck = createPrincipalNameCheck('group');

// ! A provider whose groups a remote system owns is not offered — the server would refuse the create.
export const $groupEditorProviders = computed(
  $idProviderNames,
  ({ items }): readonly IdProviderName[] => items.filter(({ mode }) => allowsWrite(mode, 'group')),
);

// The name a provider already holds is an error like any other; while the answer is on its way, the name
// holds the later steps back without a message.
// ? `$idProviderModeByKey` is a dependency so that `$errors` re-runs `validate` when the providers
// ? arrive: whether a group's fields are validated at all depends on its provider's mode, which the
// ? dialog's own state does not carry.
const $groupNameExternal = computed(
  [groupNameCheck.$state, $idProviderModeByKey],
  (check): StepDialogExternal<GroupFormField> => ({
    errors: check.status === 'taken' ? { name: 'groups.dialog.idTaken' } : {},
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
  titleKey: 'groups.dialog.createTitle',
  initialForm: (payload) => initialGroupForm(payload, onlyProvider()),
  validate: (form, { mode, entity }) =>
    validateGroupForm(form, mode, {
      remoteGroup: isRemoteGroup(entity, $idProviderModeByKey.get()),
    }),
  same: sameGroupForm,
  next: nextGroupForm,
  $external: $groupNameExternal,
  reset: groupNameCheck.forget,
});

export const $groupEditor = groupEditorDialog.$state;
export const $groupEditorErrors = groupEditorDialog.$errors;

export const openGroupEditor = groupEditorDialog.open;

/** A group whose fields a remote system owns — or whose provider is not known yet, which locks the same. */
function isRemoteGroup(
  entity: Group | undefined,
  modes: ReadonlyMap<string, IdProviderMode>,
): boolean {
  return entity !== undefined && !allowsWrite(modes.get(idProviderOf(entity.key) ?? ''), 'group');
}

export function openGroupEditorAt(group: Group, step: GroupEditorStep): void {
  groupEditorDialog.openAt(group, step, group.displayName);
}

export const closeGroupEditor = groupEditorDialog.close;
export const markGroupEditorFieldVisited = groupEditorDialog.markVisited;
export const updateGroupEditorForm = groupEditorDialog.update;

/** The members and roles the server holds, which arrive long after the dialog opens. */
export function seedGroupEditorLists(lists: {
  members: readonly PrincipalRef[];
  roles: readonly PrincipalRef[];
}): void {
  // The picks made while the read was in flight survive it.
  groupEditorDialog.seed(lists, (seeded, current) => ({
    members: mergeByKey(seeded.members ?? [], current.members),
    roles: mergeByKey(seeded.roles ?? [], current.roles),
  }));
}

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
    groupNameCheck.ask(form.idProvider, form.name, { immediate });
  }
}

// Where a create starts: the one provider it may create in, otherwise none.
function onlyProvider(): string {
  const providers = $groupEditorProviders.get();

  return providers.length === 1 ? (providers[0]?.key ?? '') : '';
}
