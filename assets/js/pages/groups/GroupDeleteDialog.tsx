import { useStore } from '@nanostores/preact';

import { deletePrincipals } from '../../entities/principal';
import { PrincipalLabel } from '../../entities/principal/ui/PrincipalLabel';
import { useHostFrame } from '../../shared/host';
import { DeleteConfirmDialog } from '../../shared/ui/dialogs/DeleteConfirmDialog';
import { groupsDeletion } from './model/deletion.store';
import { loadGroupsScreen } from './model/groups.screen';
import { groupsSelection } from './model/selection.store';

export type GroupDeleteDialogProps = {
  activeKey?: string;
  onCloseItem: () => void;
};

export function GroupDeleteDialog({ activeKey, onCloseItem }: GroupDeleteDialogProps) {
  const targets = useStore(groupsDeletion.$payload);
  const { notifyError, notifySuccess } = useHostFrame();

  return (
    <DeleteConfirmDialog
      open={targets !== undefined}
      targets={(targets ?? []).map((group) => ({
        key: group.key,
        label: <PrincipalLabel principal={group} />,
      }))}
      onClose={groupsDeletion.close}
      onConfirm={() => {
        const confirmed = targets ?? [];
        groupsDeletion.close();

        void deletePrincipals(confirmed, {
          resync: () => void loadGroupsScreen(),
          closeItem: onCloseItem,
          activeKey,
          selection: groupsSelection,
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
