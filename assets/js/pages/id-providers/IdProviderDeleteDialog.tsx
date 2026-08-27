import { useStore } from '@nanostores/preact';

import { deleteIdProviders, loadIdProviders } from '../../entities/principal';
import { DeleteConfirmDialog } from '../../shared/ui/dialogs/DeleteConfirmDialog';
import { idProvidersDeletion } from './model/deletion.store';
import { idProvidersSelection } from './model/selection.store';

export type IdProviderDeleteDialogProps = {
  activeKey?: string;
  onCloseItem: () => void;
};

export function IdProviderDeleteDialog({ activeKey, onCloseItem }: IdProviderDeleteDialogProps) {
  const targets = useStore(idProvidersDeletion.$payload);

  return (
    <DeleteConfirmDialog
      open={targets !== undefined}
      targets={(targets ?? []).map(({ key, displayName }) => ({ key, label: displayName }))}
      onClose={idProvidersDeletion.close}
      onConfirm={() => {
        const confirmed = targets ?? [];
        idProvidersDeletion.close();

        void deleteIdProviders(confirmed, {
          resync: () => void loadIdProviders(),
          closeItem: onCloseItem,
          activeKey,
          selection: idProvidersSelection,
        });
      }}
    />
  );
}
