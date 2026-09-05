import { Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import { createUser, updateUser, type User } from '../../../entities/principal';
import { useHostFrame } from '../../../shared/host';
import { i18n } from '../../../shared/i18n';
import { useDialogLayer } from '../../../shared/ui/dialogs/dialog-stack';
import { downloadPrivateKey } from '../model/key-file';
import { applyPublicKeyChanges } from '../model/public-key-writes';
import { userDraftFrom } from '../model/user-draft';
import { userEditFrom } from '../model/user-edit';
import { forgetUserEditDetail, showUserForEdit } from '../model/user-edit-detail';
import {
  firstUserEditorStepWithError,
  USER_EDITOR_STEP_ORDER,
  type UserEditorStep,
} from '../model/user-editor-steps';
import {
  $userEditor,
  $userEditorErrors,
  beginUserEditorSave,
  closeUserEditor,
  endUserEditorSave,
  goToUserEditorStep,
  markUserEditorFieldVisited,
} from '../model/user-editor.store';
import { sameUserForm, USER_FORM_FIELDS } from '../model/user-form';
import { useUserEditorMemberships } from '../model/useUserEditorMemberships';
import { USER_EDITOR_STEP_PANELS } from './steps';
import { UserEditorDialogFooter } from './UserEditorDialogFooter';
import { UserEditorDialogHeader } from './UserEditorDialogHeader';

const NOTIFY = {
  created: 'users.notify.created',
  updated: 'users.notify.updated',
} as const;

const FAILED = {
  created: 'users.notify.createFailed',
  updated: 'users.notify.updateFailed',
} as const;

export type UserEditorDialogProps = {
  onSaved: (written: User, mode: 'create' | 'edit') => void;
};

export function UserEditorDialog({ onSaved }: UserEditorDialogProps) {
  const { open, view, step, mode, form, saved, saving, user } = useStore($userEditor, {
    keys: ['open', 'view', 'step', 'mode', 'form', 'saved', 'saving', 'user'],
  });
  const errors = useStore($userEditorErrors);
  const { notify } = useHostFrame();
  const { blocked } = useDialogLayer(open);

  useUserEditorMemberships();

  const editedKey = user?.key;

  // The detail carries the public keys, and the memberships the later steps will seed from.
  useEffect(() => {
    showUserForEdit(editedKey);

    return forgetUserEditDetail;
  }, [editedKey]);

  const save = async (): Promise<void> => {
    const unanswered = firstUserEditorStepWithError(errors);

    if (unanswered !== undefined) {
      USER_FORM_FIELDS.forEach(markUserEditorFieldVisited);
      goToUserEditorStep(unanswered);
      return;
    }

    // An edit with nothing to send is a wizard the user walked through and left alone.
    if (mode === 'edit' && sameUserForm(saved, form)) {
      closeUserEditor();
      return;
    }

    beginUserEditorSave();

    const written =
      mode === 'edit' && user !== undefined
        ? await updateUser(user.key, userEditFrom(form, saved))
        : await createUser(userDraftFrom(form));

    await written.match(
      async (result) => {
        await writeStagedPublicKeys(result);
        notify(
          'success',
          i18n(mode === 'edit' ? NOTIFY.updated : NOTIFY.created, result.displayName),
        );
        closeUserEditor();
        onSaved(result, mode);
      },
      async (error) => {
        console.error(error.message);
        notify('error', i18n(mode === 'edit' ? FAILED.updated : FAILED.created));
        endUserEditorSave();
      },
    );
  };

  // The keys are written against a user that now exists, and the private half of a generated pair
  // reaches its owner here — the only moment it can be named after the key the server stored.
  const writeStagedPublicKeys = async (written: User): Promise<void> => {
    const { downloads, failed } = await applyPublicKeyChanges(written.key, form);

    downloads.forEach(({ pair, stored }) => {
      notify('success', i18n('users.notify.keySaved', downloadPrivateKey(written, pair, stored)));
    });

    if (failed > 0) {
      notify('error', i18n('users.notify.keysFailed'));
    }
  };

  // A section opened from the details panel shows its own step and no way out of it.
  const panels = view === 'wizard' ? USER_EDITOR_STEP_ORDER : [step];

  return (
    <Dialog
      open={open}
      step={step}
      onStepChange={(next) => goToUserEditorStep(next as UserEditorStep)}
      onOpenChange={(next) => {
        if (!next && !saving && !blocked) {
          closeUserEditor();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content
          className="gap-10 p-5 md:max-w-184 md:min-w-180 md:p-10"
          onEscapeKeyDown={(event) => {
            if (blocked) {
              event.preventDefault();
            }
          }}
        >
          <UserEditorDialogHeader />

          <Dialog.Body className="-m-1.5 p-1.5">
            {panels.map((value) => {
              const Panel = USER_EDITOR_STEP_PANELS[value];
              return <Panel key={value} />;
            })}
          </Dialog.Body>

          <UserEditorDialogFooter onSave={() => void save()} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
