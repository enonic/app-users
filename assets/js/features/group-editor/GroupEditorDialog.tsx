import { useStore } from '@nanostores/preact';
import { Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'preact/hooks';

import { createGroup, updateGroup, useIdProviderNames } from '../../entities/principal';
import { diffByKey, mergeByKey, visitedErrors } from '../../shared/form';
import { i18n, useI18n } from '../../shared/i18n';
import { DialogIdentityHeader } from '../../shared/ui/dialogs/DialogIdentityHeader';
import { ModalDialog } from '../../shared/ui/dialogs/ModalDialog';
import { GroupForm } from './GroupForm';
import {
  $groupEditDetail,
  forgetGroupEditDetail,
  showGroupForEdit,
} from './model/group-edit-detail';
import { $groupEditor, closeGroupEditor } from './model/group-editor.store';
import {
  GROUP_FORM_FIELDS,
  initialGroupForm,
  nextGroupForm,
  sameGroupForm,
  validateGroupForm,
  type GroupFormField,
  type GroupForm as GroupFormValues,
} from './model/group-form';

export type GroupEditorDialogProps = {
  /** Puts the section's list back in step with what was written. */
  onSaved: () => void;
};

export function GroupEditorDialog({ onSaved }: GroupEditorDialogProps) {
  const editor = useStore($groupEditor);
  const detail = useStore($groupEditDetail);
  const editedKey = editor?.mode === 'edit' ? editor.group.key : undefined;
  const { items: providers } = useIdProviderNames();

  const createTitle = useI18n('groups.dialog.createTitle');
  const editTitle = useI18n('groups.dialog.editTitle');
  const displayNameLabel = useI18n('groups.dialog.displayName');
  const displayNamePlaceholder = useI18n('groups.dialog.displayNamePlaceholder');
  const listsFailed = useI18n('groups.dialog.listsFailed');
  const saveLabel = useI18n('browse.dialog.save');
  const cancelLabel = useI18n('browse.dialog.cancel');
  const closeLabel = useI18n('browse.dialog.close');

  const [values, setValues] = useState<GroupFormValues | undefined>();
  // What the server holds, kept beside what the user is editing, so `Save` can tell the two apart.
  const [saved, setSaved] = useState<GroupFormValues | undefined>();
  const [nameEdited, setNameEdited] = useState(false);
  const [visited, setVisited] = useState<ReadonlySet<GroupFormField>>(new Set());
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | undefined>();
  const [seeded, setSeeded] = useState(false);

  const onlyProvider = providers.length === 1 ? providers[0]?.key : undefined;

  useEffect(() => {
    const opened = editor === undefined ? undefined : initialGroupForm(editor, onlyProvider);
    setValues(opened);
    setSaved(opened);
    setNameEdited(false);
    setVisited(new Set());
    setSaving(false);
    setFailure(undefined);
    setSeeded(false);
    showGroupForEdit(editedKey);
  }, [editor, editedKey, onlyProvider]);

  useEffect(() => {
    const loaded = detail.item;
    if (loaded === undefined || loaded.key !== editedKey) {
      return;
    }

    const held = { members: loaded.members, roles: loaded.roles };

    if (!seeded) {
      setValues((current) =>
        current === undefined
          ? current
          : {
              ...current,
              members: mergeByKey(loaded.members, current.members),
              roles: mergeByKey(loaded.roles, current.roles),
            },
      );
      setSaved((current) => (current === undefined ? current : { ...current, ...held }));
      setSeeded(true);
      return;
    }

    setValues((current) => (current === undefined ? current : { ...current, ...held }));
    setSaved((current) => (current === undefined ? current : { ...current, ...held }));
  }, [detail.item, editedKey, seeded]);

  const errors = useMemo(
    () =>
      values === undefined || editor === undefined ? {} : validateGroupForm(values, editor.mode),
    [values, editor],
  );

  const shownErrors = useMemo(() => visitedErrors(errors, visited), [errors, visited]);

  const unchanged = values !== undefined && saved !== undefined && sameGroupForm(saved, values);

  const handleChange = (next: GroupFormValues): void => {
    if (values === undefined || editor === undefined) {
      return;
    }

    const change = nextGroupForm(values, next, editor.mode, nameEdited);
    setValues(change.values);
    setNameEdited(change.nameEdited);
  };

  const handleSave = async (): Promise<void> => {
    if (values === undefined || editor === undefined) {
      return;
    }

    if (Object.keys(errors).length > 0) {
      setVisited(new Set(GROUP_FORM_FIELDS));
      return;
    }

    setSaving(true);
    setFailure(undefined);

    const members = diffByKey(saved?.members ?? [], values.members);
    const roles = diffByKey(saved?.roles ?? [], values.roles);

    const written =
      editor.mode === 'edit'
        ? await updateGroup(editor.group.key, {
            displayName: values.displayName,
            description: values.description,
            addMembers: members.added,
            removeMembers: members.removed,
            addRoles: roles.added,
            removeRoles: roles.removed,
          })
        : await createGroup({
            ...values,
            members: values.members.map(({ key }) => key),
            roles: values.roles.map(({ key }) => key),
          });

    written.match(
      () => {
        forgetGroupEditDetail();
        closeGroupEditor();
        onSaved();
      },
      (error) => {
        setSaving(false);
        setFailure(error.message);
        if (editedKey !== undefined) {
          forgetGroupEditDetail();
          showGroupForEdit(editedKey);
        }
      },
    );
  };

  return (
    <ModalDialog
      open={editor !== undefined}
      title={editor?.mode === 'edit' ? editTitle : createTitle}
      size="wide"
      primaryLabel={saveLabel}
      primaryDisabled={saving || unchanged}
      cancelLabel={cancelLabel}
      closeLabel={closeLabel}
      error={failure ?? (detail.status === 'error' ? listsFailed : undefined)}
      // ! Stays put while the write is in flight. Closing would leave the rejection with no screen to
      // ! land on, and the command hands it back rather than notifying for exactly that reason.
      onClose={() => {
        if (!saving) {
          closeGroupEditor();
        }
      }}
      onPrimary={() => void handleSave()}
      header={
        values === undefined ? undefined : (
          <DialogIdentityHeader
            icon={<Users size={40} strokeWidth={1.5} aria-hidden />}
            label={displayNameLabel}
            placeholder={displayNamePlaceholder}
            value={values.displayName}
            error={
              shownErrors.displayName === undefined ? undefined : i18n(shownErrors.displayName)
            }
            onInput={(displayName) => handleChange({ ...values, displayName })}
          />
        )
      }
    >
      {values !== undefined && editor !== undefined && (
        <GroupForm
          values={values}
          errors={shownErrors}
          providers={providers}
          groupKey={editedKey}
          keyFixed={editor.mode === 'edit'}
          onChange={handleChange}
          onBlur={(field) => setVisited((current) => new Set(current).add(field))}
        />
      )}
    </ModalDialog>
  );
}
