import { KeyRound } from 'lucide-react';

import { formatDateTime } from '../../../shared/format';
import { useI18n } from '../../../shared/i18n';
import type { PublicKeyRow } from '../model/public-key-changes';

export type PublicKeyCardProps = {
  publicKey: PublicKeyRow;
  detailed?: boolean;
};

export function PublicKeyCard({ publicKey, detailed }: PublicKeyCardProps) {
  const kidLabel = useI18n('users.dialog.keyKid');
  const creationLabel = useI18n('users.dialog.keyCreationTime');
  const unlabelled = useI18n('users.dialog.keyUnlabelled');
  const pending = useI18n('users.dialog.keyPending');

  const { kid, label, creationTime } = publicKey;
  const line = kid ?? pending;

  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <KeyRound size={20} strokeWidth={1.5} aria-hidden />

      <span className="flex min-w-0 flex-col">
        <span className="truncate text-base">{label ?? unlabelled}</span>

        {detailed === true ? (
          <>
            <small className="text-subtle truncate text-sm">
              {kidLabel} {line}
            </small>

            {creationTime !== undefined && (
              <small className="text-subtle truncate text-sm">
                {creationLabel} {formatDateTime(creationTime)}
              </small>
            )}
          </>
        ) : (
          <small className="text-subtle flex min-w-0 flex-wrap items-center gap-x-2 text-sm">
            <span className="min-w-0 truncate">{line}</span>

            {creationTime !== undefined && (
              <span className="shrink-0">{formatDateTime(creationTime)}</span>
            )}
          </small>
        )}
      </span>
    </span>
  );
}
