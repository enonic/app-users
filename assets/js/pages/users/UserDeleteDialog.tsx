import { useStore } from '@nanostores/preact';

import { deletePrincipals } from '../../entities/principal';
import { PrincipalLabel } from '../../entities/principal/ui/PrincipalLabel';
import { useHostFrame } from '../../shared/host';
import { DeleteConfirmDialog } from '../../shared/ui/dialogs/DeleteConfirmDialog';
import { usersDeletion } from './model/deletion.store';
import { usersSelection } from './model/selection.store';
import { reloadUsersScreen } from './model/users.screen';

export type UserDeleteDialogProps = {
  activeKey?: string;
  onCloseItem: () => void;
};

export function UserDeleteDialog({ activeKey, onCloseItem }: UserDeleteDialogProps) {
  const targets = useStore(usersDeletion.$payload);
  const { notifyError, notifySuccess } = useHostFrame();

  return (
    <DeleteConfirmDialog
      open={targets !== undefined}
      targets={(targets ?? []).map((user) => ({
        key: user.key,
        label: <PrincipalLabel principal={user} />,
      }))}
      onClose={usersDeletion.close}
      onConfirm={() => {
        const confirmed = targets ?? [];
        usersDeletion.close();

        void deletePrincipals(confirmed, {
          resync: () => void reloadUsersScreen(),
          closeItem: onCloseItem,
          activeKey,
          selection: usersSelection,
        }).then(({ success, failures }) => {
          if (success !== undefined) {
            notifySuccess(success);
          }
          failures.forEach(notifyError);
        });
      }}
    />
  );
}
