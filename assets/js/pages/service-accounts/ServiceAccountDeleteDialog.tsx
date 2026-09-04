import { useStore } from '@nanostores/preact';

import { deletePrincipals, principalName } from '../../entities/principal';
import { PrincipalLabel } from '../../entities/principal/ui/PrincipalLabel';
import { useHostFrame } from '../../shared/host';
import { deleteExpectation } from '../../shared/ui/dialogs/delete-confirm';
import { DeleteConfirmDialog } from '../../shared/ui/dialogs/DeleteConfirmDialog';
import { serviceAccountsDeletion } from './model/deletion.store';
import { serviceAccountsSelection } from './model/selection.store';
import { reloadServiceAccountsScreen } from './model/service-accounts.screen';

export type ServiceAccountDeleteDialogProps = {
  activeKey?: string;
  onCloseItem: () => void;
};

export function ServiceAccountDeleteDialog({
  activeKey,
  onCloseItem,
}: ServiceAccountDeleteDialogProps) {
  const targets = useStore(serviceAccountsDeletion.$payload);
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
      onClose={serviceAccountsDeletion.close}
      onConfirm={() => {
        const confirmed = targets ?? [];
        serviceAccountsDeletion.close();

        void deletePrincipals(confirmed, {
          resync: () => void reloadServiceAccountsScreen(),
          closeItem: onCloseItem,
          activeKey,
          selection: serviceAccountsSelection,
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
