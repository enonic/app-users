import { useStore } from '@nanostores/preact';

import { deletePrincipals, principalName } from '../../entities/principal';
import { PrincipalLabel } from '../../entities/principal/ui/PrincipalLabel';
import { useHostFrame } from '../../shared/host';
import { deleteExpectation } from '../../shared/ui/dialogs/delete-confirm';
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
  const { notify } = useHostFrame();

  const deleteTargets = (targets ?? []).map((user) => ({
    key: user.key,
    name: principalName(user.key),
    label: <PrincipalLabel principal={user} />,
  }));

  return (
    <DeleteConfirmDialog
      open={targets !== undefined}
      targets={deleteTargets}
      expected={deleteExpectation(deleteTargets)}
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
            notify('success', success);
          }
          failures.forEach((failure) => notify('error', failure));
        });
      }}
    />
  );
}
