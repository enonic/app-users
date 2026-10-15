import { ActionDialog, DeleteConfirm, type DeleteTarget } from '@enonic/ui-kit';

import { useI18n } from '../../i18n';

export type { DeleteTarget };

export type DeleteConfirmDialogProps = {
  open: boolean;
  targets: readonly DeleteTarget[];
  onClose: () => void;
  onConfirm: () => void;
  'data-component'?: string;
};

const DELETE_CONFIRM_DIALOG_NAME = 'DeleteConfirmDialog';

/** The kit's delete view under its own root, worded by this app: the one name or the count is typed back. */
export function DeleteConfirmDialog({
  open,
  targets,
  onClose,
  onConfirm,
  'data-component': componentName = DELETE_CONFIRM_DIALOG_NAME,
}: DeleteConfirmDialogProps) {
  const title = useI18n('browse.confirm.title');
  const question = useI18n(
    targets.length === 1
      ? 'browse.confirm.deleteQuestion'
      : 'browse.confirm.deleteQuestionMultiple',
  );

  return (
    <ActionDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      <ActionDialog.Portal>
        <ActionDialog.Overlay />
        <DeleteConfirm
          data-component={componentName}
          title={title}
          question={question}
          targets={targets}
          onConfirm={onConfirm}
        />
      </ActionDialog.Portal>
    </ActionDialog.Root>
  );
}

DeleteConfirmDialog.displayName = DELETE_CONFIRM_DIALOG_NAME;
