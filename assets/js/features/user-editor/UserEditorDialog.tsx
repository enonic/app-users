import { useStore } from '@nanostores/preact';
import { UserIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'preact/hooks';

import {
  addPublicKey,
  createUser,
  isSystemUser,
  removePublicKey,
  SYSTEM_ID_PROVIDER,
  updateUser,
  useIdProviderNames,
  type User,
} from '../../entities/principal';
import { diffByKey, mergeByKey, visitedErrors } from '../../shared/form';
import { useHostFrame } from '../../shared/host';
import { i18n, useI18n } from '../../shared/i18n';
import { DialogIdentityHeader } from '../../shared/ui/dialogs/DialogIdentityHeader';
import { ModalDialog } from '../../shared/ui/dialogs/ModalDialog';
import type { AddOutcome } from './AddPublicKeyDialog';
import { downloadPrivateKey } from './model/key-file';
import {
  $serviceAccountEditDetail,
  forgetServiceAccountEditDetail,
  showServiceAccountForEdit,
} from './model/service-account-edit-detail';
import {
  $serviceAccountEditor,
  closeServiceAccountEditor,
} from './model/service-account-editor.store';
import { $userEditDetail, forgetUserEditDetail, showUserForEdit } from './model/user-edit-detail';
import { $userEditor, closeUserEditor } from './model/user-editor.store';
import {
  USER_FORM_FIELDS,
  initialUserForm,
  nextUserForm,
  sameUserForm,
  validateUserForm,
  type UserFormField,
  type UserForm as UserFormValues,
} from './model/user-form';
import { UserForm } from './UserForm';

export type UserEditorDialogProps = {
  onSaved: (written: User, mode: 'create' | 'edit') => void;
  /**
   * The Service Accounts variant: its own dialog store — both sections stay mounted, so sharing one
   * would open the dialog in each — the provider fixed to `system` and never offered, and its own copy.
   */
  serviceAccount?: boolean;
};

const USER_TEXT = {
  createTitle: 'users.dialog.createTitle',
  editTitle: 'users.dialog.editTitle',
  created: 'users.notify.created',
  updated: 'users.notify.updated',
} as const;

const SERVICE_ACCOUNT_TEXT = {
  createTitle: 'serviceAccounts.dialog.createTitle',
  editTitle: 'serviceAccounts.dialog.editTitle',
  created: 'serviceAccounts.notify.created',
  updated: 'serviceAccounts.notify.updated',
} as const;

export function UserEditorDialog({ onSaved, serviceAccount = false }: UserEditorDialogProps) {
  const editor = useStore(serviceAccount ? $serviceAccountEditor : $userEditor);
  const detail = useStore(serviceAccount ? $serviceAccountEditDetail : $userEditDetail);
  const editedKey = editor?.mode === 'edit' ? editor.user.key : undefined;
  const { items: providers } = useIdProviderNames();
  const { notify } = useHostFrame();

  const close = serviceAccount ? closeServiceAccountEditor : closeUserEditor;
  const forgetEditDetail = serviceAccount ? forgetServiceAccountEditDetail : forgetUserEditDetail;
  const showForEdit = serviceAccount ? showServiceAccountForEdit : showUserForEdit;
  const text = serviceAccount ? SERVICE_ACCOUNT_TEXT : USER_TEXT;

  const createTitle = useI18n(text.createTitle);
  const editTitle = useI18n(text.editTitle);
  const displayNameLabel = useI18n('users.dialog.displayName');
  const displayNamePlaceholder = useI18n('users.dialog.displayNamePlaceholder');
  const membershipsFailed = useI18n('users.dialog.membershipsFailed');
  const noKeyTargetLabel = useI18n('users.dialog.keyNeedsSavedUser');
  const saveLabel = useI18n('browse.dialog.save');
  const cancelLabel = useI18n('browse.dialog.cancel');
  const closeLabel = useI18n('browse.dialog.close');

  const [values, setValues] = useState<UserFormValues | undefined>();
  const [saved, setSaved] = useState<UserFormValues | undefined>();
  const [nameEdited, setNameEdited] = useState(false);
  const [visited, setVisited] = useState<ReadonlySet<UserFormField>>(new Set());
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | undefined>();
  const [seeded, setSeeded] = useState(false);

  const onlyProvider = serviceAccount
    ? SYSTEM_ID_PROVIDER
    : providers.length === 1
      ? providers[0]?.key
      : undefined;

  useEffect(() => {
    const opened = editor === undefined ? undefined : initialUserForm(editor, onlyProvider);
    setValues(opened);
    setSaved(opened);
    setNameEdited(false);
    setVisited(new Set());
    setSaving(false);
    setFailure(undefined);
    setSeeded(false);
    showForEdit(editedKey);
  }, [editor, editedKey, onlyProvider]);

  useEffect(() => {
    const loaded = detail.item;
    if (loaded === undefined || loaded.key !== editedKey) {
      return;
    }

    const held = { roles: loaded.roles, groups: loaded.groups };

    if (!seeded) {
      setValues((current) =>
        current === undefined
          ? current
          : {
              ...current,
              roles: mergeByKey(loaded.roles, current.roles),
              groups: mergeByKey(loaded.groups, current.groups),
            },
      );
      setSaved((current) => (current === undefined ? current : { ...current, ...held }));
      setSeeded(true);
      return;
    }

    setValues((current) => (current === undefined ? current : { ...current, ...held }));
    setSaved((current) => (current === undefined ? current : { ...current, ...held }));
  }, [detail.item, editedKey, seeded]);

  const systemUser = editedKey !== undefined && isSystemUser(editedKey);
  const loaded = detail.item;
  const loadedKeys = loaded !== undefined && loaded.key === editedKey ? loaded.publicKeys : [];

  const errors = useMemo(
    () =>
      values === undefined || editor === undefined
        ? {}
        : validateUserForm(values, editor.mode, systemUser),
    [values, editor, systemUser],
  );

  const shownErrors = useMemo(() => visitedErrors(errors, visited), [errors, visited]);

  const unchanged = values !== undefined && saved !== undefined && sameUserForm(saved, values);

  const handleChange = (next: UserFormValues): void => {
    if (values === undefined || editor === undefined) {
      return;
    }

    const change = nextUserForm(values, next, editor.mode, nameEdited);
    setValues(change.values);
    setNameEdited(change.nameEdited);
  };

  const reloadKeys = (): void => {
    if (editedKey !== undefined) {
      forgetEditDetail();
      showForEdit(editedKey);
    }
  };

  const handleAddKey = async (publicKey: string, label?: string): Promise<AddOutcome> => {
    if (editedKey === undefined) {
      return { error: noKeyTargetLabel };
    }

    const written = await addPublicKey(editedKey, publicKey, label);

    return written.match(
      (stored) => {
        reloadKeys();
        return { stored };
      },
      (error) => ({ error: error.message }),
    );
  };

  const handleRemoveKey = async (kid: string): Promise<string | undefined> => {
    if (editedKey === undefined) {
      return noKeyTargetLabel;
    }

    const removed = await removePublicKey(editedKey, kid);

    return removed.match(
      () => {
        reloadKeys();
        return undefined;
      },
      (error) => error.message,
    );
  };

  const handleSave = async (): Promise<void> => {
    if (values === undefined || editor === undefined) {
      return;
    }

    if (Object.keys(errors).length > 0) {
      setVisited(new Set(USER_FORM_FIELDS));
      return;
    }

    setSaving(true);
    setFailure(undefined);

    const roles = diffByKey(saved?.roles ?? [], values.roles);
    const groups = diffByKey(saved?.groups ?? [], values.groups);

    const written =
      editor.mode === 'edit'
        ? await updateUser(editor.user.key, {
            displayName: values.displayName,
            email: values.email,
            password: values.clearPassword === true ? '' : values.password,
            addRoles: roles.added,
            removeRoles: roles.removed,
            addGroups: groups.added,
            removeGroups: groups.removed,
          })
        : await createUser({
            ...values,
            roles: values.roles.map(({ key }) => key),
            groups: values.groups.map(({ key }) => key),
          });

    written.match(
      (user) => {
        notify(
          'success',
          i18n(editor.mode === 'edit' ? text.updated : text.created, user.displayName),
        );
        forgetEditDetail();
        close();
        onSaved(user, editor.mode);
      },
      (error) => {
        setSaving(false);
        setFailure(error.message);
        if (editedKey !== undefined) {
          forgetEditDetail();
          showForEdit(editedKey);
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
      error={failure ?? (detail.status === 'error' ? membershipsFailed : undefined)}
      onClose={() => {
        if (!saving) {
          close();
        }
      }}
      onPrimary={() => void handleSave()}
      header={
        values === undefined ? undefined : (
          <DialogIdentityHeader
            icon={<UserIcon size={40} strokeWidth={1.5} aria-hidden />}
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
        <UserForm
          values={values}
          keys={loadedKeys}
          errors={shownErrors}
          providers={providers}
          persisted={editor.mode === 'edit'}
          systemUser={systemUser}
          serviceAccount={serviceAccount}
          hasPassword={editor.mode === 'edit' && editor.user.hasPassword === true}
          onChange={handleChange}
          onAddKey={handleAddKey}
          onRemoveKey={handleRemoveKey}
          onKeyGenerated={(pair, stored) => {
            downloadPrivateKey(editor.mode === 'edit' ? editor.user : undefined, pair, stored);
            notify('success', i18n('users.dialog.keySaved', stored.kid));
          }}
          onBlur={(field) => setVisited((current) => new Set(current).add(field))}
        />
      )}
    </ModalDialog>
  );
}
