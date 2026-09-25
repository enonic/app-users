import { useStore } from '@nanostores/preact';

import { deletePrincipals, principalName } from '../../entities/principal';
import { useHostFrame } from '../../shared/host';
import { deleteExpectation } from '../../shared/ui/dialogs/delete-confirm';
import { DeleteConfirmDialog } from '../../shared/ui/dialogs/DeleteConfirmDialog';
import { groupsDeletion } from './model/deletion.store';
import { loadGroupsScreen } from './model/groups.screen';
import { groupsSelection } from './model/selection.store';

export type GroupDeleteDialogProps = {
  activeKey?: string;
  onCloseItem: () => void;
  'data-component'?: string;
};

const GROUP_DELETE_DIALOG_NAME = 'GroupDeleteDialog';

export function GroupDeleteDialog({
  activeKey,
  onCloseItem,
  'data-component': componentName = GROUP_DELETE_DIALOG_NAME,
}: GroupDeleteDialogProps) {
  const targets = useStore(groupsDeletion.$payload);
  const { notify } = useHostFrame();

  const deleteTargets = (targets ?? []).map((group) => ({
    key: group.key,
    name: principalName(group.key),
    displayName: group.displayName,
  }));

  return (
    <DeleteConfirmDialog
      data-component={componentName}
      open={targets !== undefined}
      targets={deleteTargets}
      expected={deleteExpectation(deleteTargets)}
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
            notify('success', success);
          }
          failures.forEach((failure) => notify('error', failure));
        });
      }}
    />
  );
}

GroupDeleteDialog.displayName = GROUP_DELETE_DIALOG_NAME;
