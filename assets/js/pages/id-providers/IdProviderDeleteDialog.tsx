import { useStore } from '@nanostores/preact';

import { deleteIdProviders, loadIdProviders } from '../../entities/principal';
import { useHostFrame } from '../../shared/host';
import { deleteExpectation } from '../../shared/ui/dialogs/delete-confirm';
import { DeleteConfirmDialog } from '../../shared/ui/dialogs/DeleteConfirmDialog';
import { idProvidersDeletion } from './model/deletion.store';
import { idProvidersSelection } from './model/selection.store';

export type IdProviderDeleteDialogProps = {
  activeKey?: string;
  onCloseItem: () => void;
};

export function IdProviderDeleteDialog({ activeKey, onCloseItem }: IdProviderDeleteDialogProps) {
  const targets = useStore(idProvidersDeletion.$payload);
  const { notify } = useHostFrame();

  const deleteTargets = (targets ?? []).map(({ key, displayName }) => ({
    key,
    name: key,
    label: displayName,
  }));

  return (
    <DeleteConfirmDialog
      open={targets !== undefined}
      targets={deleteTargets}
      expected={deleteExpectation(deleteTargets)}
      onClose={idProvidersDeletion.close}
      onConfirm={() => {
        const confirmed = targets ?? [];
        idProvidersDeletion.close();

        void deleteIdProviders(confirmed, {
          resync: () => void loadIdProviders(),
          closeItem: onCloseItem,
          activeKey,
          selection: idProvidersSelection,
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
