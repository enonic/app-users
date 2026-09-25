import { useStore } from '@nanostores/preact';

import { deletePrincipals, principalName } from '../../entities/principal';
import { useHostFrame } from '../../shared/host';
import { deleteExpectation } from '../../shared/ui/dialogs/delete-confirm';
import { DeleteConfirmDialog } from '../../shared/ui/dialogs/DeleteConfirmDialog';
import { serviceAccountsDeletion } from './model/deletion.store';
import { serviceAccountsSelection } from './model/selection.store';
import { reloadServiceAccountsScreen } from './model/service-accounts.screen';

export type ServiceAccountDeleteDialogProps = {
  activeKey?: string;
  onCloseItem: () => void;
  'data-component'?: string;
};

const SERVICE_ACCOUNT_DELETE_DIALOG_NAME = 'ServiceAccountDeleteDialog';

export function ServiceAccountDeleteDialog({
  activeKey,
  onCloseItem,
  'data-component': componentName = SERVICE_ACCOUNT_DELETE_DIALOG_NAME,
}: ServiceAccountDeleteDialogProps) {
  const targets = useStore(serviceAccountsDeletion.$payload);
  const { notify } = useHostFrame();

  const deleteTargets = (targets ?? []).map((user) => ({
    key: user.key,
    name: principalName(user.key),
    displayName: user.displayName,
  }));

  return (
    <DeleteConfirmDialog
      data-component={componentName}
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

ServiceAccountDeleteDialog.displayName = SERVICE_ACCOUNT_DELETE_DIALOG_NAME;
