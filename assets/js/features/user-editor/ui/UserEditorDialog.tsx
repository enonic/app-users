import { useStore } from '@nanostores/preact';
import { User as UserGlyph } from 'lucide-react';
import { useEffect } from 'preact/hooks';

import { createUser, updateUser, type User } from '../../../entities/principal';
import { useHostFrame } from '../../../shared/host';
import { i18n } from '../../../shared/i18n';
import { runStepDialogSave, type StepDialogMode } from '../../../shared/step-dialog';
import { StepDialog } from '../../../shared/step-dialog/StepDialog';
import { downloadPrivateKey } from '../model/key-file';
import { applyPublicKeyChanges } from '../model/public-key-writes';
import { userDraftFrom } from '../model/user-draft';
import { userEditFrom } from '../model/user-edit';
import { forgetUserEditDetail, showUserForEdit } from '../model/user-edit-detail';
import {
  $userEditor,
  $userEditorServiceAccount,
  userEditorDialog,
} from '../model/user-editor.store';
import type { UserForm } from '../model/user-form';
import { useUserEditorMemberships } from '../model/useUserEditorMemberships';
import { USER_EDITOR_STEP_PANELS } from './steps';

type Text = {
  titles: Record<StepDialogMode, string>;
  notices: Record<'created' | 'updated' | 'createFailed' | 'updateFailed', string>;
};

const USER_TEXT: Text = {
  titles: { create: 'users.dialog.createTitle', edit: 'users.dialog.editTitle' },
  notices: {
    created: 'users.notify.created',
    updated: 'users.notify.updated',
    createFailed: 'users.notify.createFailed',
    updateFailed: 'users.notify.updateFailed',
  },
};

const SERVICE_ACCOUNT_TEXT: Text = {
  titles: {
    create: 'serviceAccounts.dialog.createTitle',
    edit: 'serviceAccounts.dialog.editTitle',
  },
  notices: {
    created: 'serviceAccounts.notify.created',
    updated: 'serviceAccounts.notify.updated',
    createFailed: 'serviceAccounts.notify.createFailed',
    updateFailed: 'serviceAccounts.notify.updateFailed',
  },
};

export type UserEditorDialogProps = {
  onSaved: (written: User, mode: StepDialogMode) => void;
  /**
   * The section this copy belongs to. Users and Service Accounts stay mounted side by side, each with a
   * copy of this dialog over the one store: the store says which section opened it, the prop is how a
   * copy knows whether that is itself.
   */
  section: 'users' | 'service-accounts';
};

export function UserEditorDialog({ onSaved, section }: UserEditorDialogProps) {
  const { entity } = useStore($userEditor, { keys: ['entity'] });
  const openedAsServiceAccount = useStore($userEditorServiceAccount);
  const { notify } = useHostFrame();

  const serviceAccount = section === 'service-accounts';

  useUserEditorMemberships();

  const editedKey = entity?.key;

  // The detail carries the public keys, and the memberships the later steps will seed from.
  useEffect(() => {
    showUserForEdit(editedKey);

    return forgetUserEditDetail;
  }, [editedKey]);

  // The keys are written against a user that now exists, and the private half of a generated pair
  // reaches its owner here — the only moment it can be named after the key the server stored.
  const writeStagedPublicKeys = async (written: User, form: UserForm): Promise<void> => {
    const { downloads, failed } = await applyPublicKeyChanges(written.key, form);

    downloads.forEach(({ pair, stored }) => {
      notify('success', i18n('users.notify.keySaved', downloadPrivateKey(written, pair, stored)));
    });

    if (failed > 0) {
      notify('error', i18n('users.notify.keysFailed'));
    }
  };

  const text = serviceAccount ? SERVICE_ACCOUNT_TEXT : USER_TEXT;

  const save = (): Promise<void> =>
    runStepDialogSave(userEditorDialog, {
      write: (form, { saved, mode, entity: edited }) =>
        mode === 'edit' && edited !== undefined
          ? updateUser(edited.key, userEditFrom(form, saved))
          : createUser(userDraftFrom(form)),
      afterWrite: writeStagedPublicKeys,
      notices: text.notices,
      notify,
      onSaved,
    });

  if (openedAsServiceAccount !== serviceAccount) {
    return null;
  }

  return (
    <StepDialog
      store={userEditorDialog}
      glyph={<UserGlyph size={40} strokeWidth={1.5} className="text-main" aria-hidden />}
      titles={text.titles}
      panels={USER_EDITOR_STEP_PANELS}
      onSave={() => void save()}
    />
  );
}
