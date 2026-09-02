import { useI18n } from '../../i18n';
import { ConfirmValueDialog } from './ConfirmValueDialog';
import { deleteExpectation, type DeleteTarget } from './delete-confirm';

export type { DeleteTarget };

export type DeleteConfirmDialogProps = {
  open: boolean;
  targets: readonly DeleteTarget[];
  onClose: () => void;
  onConfirm?: () => void;
};

export function DeleteConfirmDialog({
  open,
  targets,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const title = useI18n('browse.confirm.title');
  const deleteLabel = useI18n('browse.confirm.delete');
  const question = useI18n(
    targets.length === 1
      ? 'browse.confirm.deleteQuestion'
      : 'browse.confirm.deleteQuestionMultiple',
  );

  return (
    <ConfirmValueDialog
      open={open}
      title={title}
      description={question}
      expected={deleteExpectation(targets)}
      confirmLabel={deleteLabel}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <ul className="flex flex-col gap-2.5 py-1.5">
        {targets.map(({ key, label }) => (
          <li key={key}>{label}</li>
        ))}
      </ul>
    </ConfirmValueDialog>
  );
}
