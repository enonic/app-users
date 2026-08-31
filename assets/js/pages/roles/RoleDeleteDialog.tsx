import { useStore } from '@nanostores/preact';

import { deletePrincipals } from '../../entities/principal';
import { PrincipalLabel } from '../../entities/principal/ui/PrincipalLabel';
import { useHostFrame } from '../../shared/host';
import { DeleteConfirmDialog } from '../../shared/ui/dialogs/DeleteConfirmDialog';
import { rolesDeletion } from './model/deletion.store';
import { loadRolesScreen } from './model/roles.screen';
import { rolesSelection } from './model/selection.store';

export type RoleDeleteDialogProps = {
  activeKey?: string;
  onCloseItem: () => void;
};

export function RoleDeleteDialog({ activeKey, onCloseItem }: RoleDeleteDialogProps) {
  const targets = useStore(rolesDeletion.$payload);
  const { notifyError, notifySuccess } = useHostFrame();

  return (
    <DeleteConfirmDialog
      open={targets !== undefined}
      targets={(targets ?? []).map((role) => ({
        key: role.key,
        label: <PrincipalLabel principal={role} />,
      }))}
      onClose={rolesDeletion.close}
      onConfirm={() => {
        const confirmed = targets ?? [];
        rolesDeletion.close();

        void deletePrincipals(confirmed, {
          resync: () => void loadRolesScreen(),
          closeItem: onCloseItem,
          activeKey,
          selection: rolesSelection,
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
