import { useI18n } from '../../i18n';
import { ConfirmDialog } from './ConfirmDialog';
import { ConfirmValueDialog } from './ConfirmValueDialog';
import type { DeleteTarget } from './delete-confirm';

export type { DeleteTarget };

export type DeleteConfirmDialogProps = {
  open: boolean;
  targets: readonly DeleteTarget[];
  /**
   * What the operator types back before the button enables — `deleteExpectation(targets)` for the
   * usual name-or-count. Absent, the dialog confirms on a click alone.
   */
  expected?: string | number;
  onClose: () => void;
  onConfirm?: () => void;
};

export function DeleteConfirmDialog({
  open,
  targets,
  expected,
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
  const [only] = targets;
  const description =
    targets.length === 1 && only !== undefined ? (
      <>
        {question} <strong>{only.displayName}</strong>?
      </>
    ) : (
      question
    );

  if (expected === undefined) {
    return (
      <ConfirmDialog open={open} question={description} onClose={onClose} onConfirm={onConfirm} />
    );
  }

  return (
    <ConfirmValueDialog
      open={open}
      title={title}
      description={description}
      expected={expected}
      confirmLabel={deleteLabel}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
