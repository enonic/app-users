import { useI18n } from '../../shared/i18n';
import { ModalDialog } from '../../shared/ui/dialogs/ModalDialog';

export type ConfigDialogProps = {
  open: boolean;
  application: string;
  onClose: () => void;
};

export function ConfigDialog({ open, application, onClose }: ConfigDialogProps) {
  const title = useI18n('idProviders.dialog.configTitle', application);
  const pending = useI18n('idProviders.dialog.configPending');
  const closeLabel = useI18n('browse.dialog.close');
  const cancelLabel = useI18n('browse.dialog.cancel');
  const saveLabel = useI18n('browse.dialog.save');

  return (
    <ModalDialog
      open={open}
      title={title}
      primaryLabel={saveLabel}
      // TODO: [#64] The form comes from the application's own descriptor, and rendering an XP form is
      // its own piece of work. Nothing here edits the config until it exists.
      primaryDisabled
      cancelLabel={cancelLabel}
      closeLabel={closeLabel}
      onClose={onClose}
    >
      <p className="text-subtle text-base">{pending}</p>
    </ModalDialog>
  );
}
