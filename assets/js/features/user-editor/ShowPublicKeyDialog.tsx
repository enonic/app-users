import type { PublicKey } from '../../entities/principal';
import { formatDateTime } from '../../shared/format';
import { i18n, useI18n } from '../../shared/i18n';
import { ModalDialog } from '../../shared/ui/dialogs/ModalDialog';

export type ShowPublicKeyDialogProps = {
  publicKey?: PublicKey;
  onClose: () => void;
};

export function ShowPublicKeyDialog({ publicKey, onClose }: ShowPublicKeyDialogProps) {
  const title = useI18n('users.dialog.showKeyTitle');
  const kidLabel = useI18n('users.dialog.keyKid');
  const creationLabel = useI18n('users.dialog.keyCreationTime');
  const missing = useI18n('users.dialog.keyMaterialMissing');
  const closeLabel = useI18n('browse.dialog.close');

  return (
    <ModalDialog
      open={publicKey !== undefined}
      title={
        publicKey?.label === undefined
          ? title
          : i18n('users.dialog.showKeyTitleNamed', publicKey.label)
      }
      size="wide"
      cancelLabel={closeLabel}
      cancelVariant="outline"
      closeLabel={closeLabel}
      onClose={onClose}
    >
      {publicKey !== undefined && (
        <div className="flex flex-col gap-4">
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="text-subtle">{kidLabel}</dt>
              <dd className="break-all">{publicKey.kid}</dd>
            </div>

            {publicKey.creationTime !== undefined && (
              <div className="flex gap-2">
                <dt className="text-subtle">{creationLabel}</dt>
                <dd>{formatDateTime(publicKey.creationTime)}</dd>
              </div>
            )}
          </dl>

          {publicKey.publicKey === undefined ? (
            <p className="text-subtle text-sm">{missing}</p>
          ) : (
            <pre className="border-bdr-soft bg-surface-primary max-h-72 overflow-y-auto rounded-md border p-3 text-xs break-all whitespace-pre-wrap">
              {publicKey.publicKey}
            </pre>
          )}
        </div>
      )}
    </ModalDialog>
  );
}
