import { KeyRound } from 'lucide-react';

import { formatDateTime } from '../../../shared/format';
import { useI18n } from '../../../shared/i18n';
import type { PublicKeyRow } from '../model/public-key-changes';

export type PublicKeyCardProps = {
  publicKey: PublicKeyRow;
};

// The card is the whole of what a key shows: its material is downloaded as a file, never viewed here.
export function PublicKeyCard({ publicKey }: PublicKeyCardProps) {
  const unlabelled = useI18n('users.dialog.keyUnlabelled');
  const pending = useI18n('users.dialog.keyPending');

  const { kid, label, creationTime } = publicKey;

  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <KeyRound size={20} strokeWidth={1.5} aria-hidden />

      <span className="flex min-w-0 flex-col">
        <span className="truncate text-base">{label ?? unlabelled}</span>

        <small className="text-subtle flex min-w-0 flex-wrap items-center gap-x-2 text-sm">
          <span className="min-w-0 truncate">{kid ?? pending}</span>

          {creationTime !== undefined && (
            <span className="shrink-0">{formatDateTime(creationTime)}</span>
          )}
        </small>
      </span>
    </span>
  );
}
