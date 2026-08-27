import { useStore } from '@nanostores/preact';
import { UserShield } from 'lucide-react';
import { useEffect, useMemo, useState } from 'preact/hooks';

import { createRole, updateRole } from '../../entities/principal';
import { diffByKey, mergeByKey, visitedErrors } from '../../shared/form';
import { i18n, useI18n } from '../../shared/i18n';
import { DialogIdentityHeader } from '../../shared/ui/dialogs/DialogIdentityHeader';
import { ModalDialog } from '../../shared/ui/dialogs/ModalDialog';
import { $roleEditDetail, forgetRoleEditDetail, showRoleForEdit } from './model/role-edit-detail';
import { $roleEditor, closeRoleEditor } from './model/role-editor.store';
import {
  ROLE_FORM_FIELDS,
  initialRoleForm,
  nextRoleForm,
  sameRoleForm,
  validateRoleForm,
  type RoleFormField,
  type RoleForm as RoleFormValues,
} from './model/role-form';
import { RoleForm } from './RoleForm';

export type RoleEditorDialogProps = {
  /** Puts the section's list back in step with what was written. */
  onSaved: () => void;
};

export function RoleEditorDialog({ onSaved }: RoleEditorDialogProps) {
  const editor = useStore($roleEditor);
  const detail = useStore($roleEditDetail);
  const editedKey = editor?.mode === 'edit' ? editor.role.key : undefined;

  const createTitle = useI18n('roles.dialog.createTitle');
  const editTitle = useI18n('roles.dialog.editTitle');
  const displayNameLabel = useI18n('roles.dialog.displayName');
  const displayNamePlaceholder = useI18n('roles.dialog.displayNamePlaceholder');
  const membersFailed = useI18n('roles.dialog.membersFailed');
  const saveLabel = useI18n('browse.dialog.save');
  const cancelLabel = useI18n('browse.dialog.cancel');
  const closeLabel = useI18n('browse.dialog.close');

  const [values, setValues] = useState<RoleFormValues | undefined>();
  // What the server holds, kept beside what the user is editing, so `Save` can tell the two apart.
  const [saved, setSaved] = useState<RoleFormValues | undefined>();
  const [nameEdited, setNameEdited] = useState(false);
  const [visited, setVisited] = useState<ReadonlySet<RoleFormField>>(new Set());
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | undefined>();
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const opened = editor === undefined ? undefined : initialRoleForm(editor);
    setValues(opened);
    setSaved(opened);
    setNameEdited(false);
    setVisited(new Set());
    setSaving(false);
    setFailure(undefined);
    setSeeded(false);
    showRoleForEdit(editedKey);
  }, [editor, editedKey]);

  useEffect(() => {
    const loaded = detail.item;
    if (loaded === undefined || loaded.key !== editedKey) {
      return;
    }

    const held = { members: loaded.members };

    if (!seeded) {
      setValues((current) =>
        current === undefined
          ? current
          : { ...current, members: mergeByKey(loaded.members, current.members) },
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
      values === undefined || editor === undefined ? {} : validateRoleForm(values, editor.mode),
    [values, editor],
  );

  const shownErrors = useMemo(() => visitedErrors(errors, visited), [errors, visited]);

  const unchanged = values !== undefined && saved !== undefined && sameRoleForm(saved, values);

  const handleChange = (next: RoleFormValues): void => {
    if (values === undefined || editor === undefined) {
      return;
    }

    const change = nextRoleForm(values, next, editor.mode, nameEdited);
    setValues(change.values);
    setNameEdited(change.nameEdited);
  };

  const handleSave = async (): Promise<void> => {
    if (values === undefined || editor === undefined) {
      return;
    }

    if (Object.keys(errors).length > 0) {
      setVisited(new Set(ROLE_FORM_FIELDS));
      return;
    }

    setSaving(true);
    setFailure(undefined);

    const members = diffByKey(saved?.members ?? [], values.members);

    const written =
      editor.mode === 'edit'
        ? await updateRole(editor.role.key, {
            displayName: values.displayName,
            description: values.description,
            addMembers: members.added,
            removeMembers: members.removed,
          })
        : await createRole({ ...values, members: values.members.map(({ key }) => key) });

    written.match(
      () => {
        forgetRoleEditDetail();
        closeRoleEditor();
        onSaved();
      },
      (error) => {
        setSaving(false);
        setFailure(error.message);
        if (editedKey !== undefined) {
          forgetRoleEditDetail();
          showRoleForEdit(editedKey);
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
      error={failure ?? (detail.status === 'error' ? membersFailed : undefined)}
      // ! Stays put while the write is in flight. Closing would leave the rejection with no screen to
      // ! land on, and the command hands it back rather than notifying for exactly that reason.
      onClose={() => {
        if (!saving) {
          closeRoleEditor();
        }
      }}
      onPrimary={() => void handleSave()}
      header={
        values === undefined ? undefined : (
          <DialogIdentityHeader
            icon={<UserShield size={40} strokeWidth={1.5} aria-hidden />}
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
        <RoleForm
          values={values}
          errors={shownErrors}
          nameFixed={editor.mode === 'edit'}
          onChange={handleChange}
          onBlur={(field) => setVisited((current) => new Set(current).add(field))}
        />
      )}
    </ModalDialog>
  );
}
