import { notifyError } from '../../../shared/host';
import { i18n } from '../../../shared/i18n';
import type { SelectionStore } from '../../../shared/selection';
import { sendPrincipalDeletion } from '../api/principal-deletion.api';
import type { PrincipalKey } from './principal.types';

const TEXT = {
  deleteFailed: 'principal.notify.deleteFailed',
  deleteFailedReason: 'principal.notify.deleteFailedReason',
} as const;

export type DeletablePrincipal = {
  key: PrincipalKey;
  displayName: string;
};

export type PrincipalSectionScope = {
  resync: () => void;
  closeItem: () => void;
  activeKey?: string;
  selection: SelectionStore;
};

export async function deletePrincipals(
  targets: readonly DeletablePrincipal[],
  scope: PrincipalSectionScope,
): Promise<void> {
  if (targets.length === 0) {
    return;
  }

  const result = await sendPrincipalDeletion(targets.map(({ key }) => key));

  result.match(
    (outcomes) => {
      outcomes
        .filter(({ deleted }) => !deleted)
        .forEach(({ key, reason }) => notifyFailure(nameOf(targets, key), reason));

      reconcile(
        outcomes.filter(({ deleted }) => deleted).map(({ key }) => key),
        scope,
      );
    },
    (error) => {
      targets.forEach(({ displayName }) => notifyFailure(displayName, error.message));
    },
  );
}

// ! Reloads even when every key was refused: `deleted: false` also covers a row someone else has
// ! already deleted, and that one has to leave the list.
function reconcile(
  deletedKeys: readonly PrincipalKey[],
  { resync, closeItem, activeKey, selection }: PrincipalSectionScope,
): void {
  deletedKeys.forEach((key) => selection.toggle(key, false));

  if (activeKey !== undefined && deletedKeys.some((key) => key === activeKey)) {
    closeItem();
  }

  resync();
}

function notifyFailure(name: string, reason: string | undefined): void {
  notifyError(
    reason === undefined
      ? i18n(TEXT.deleteFailed, name)
      : i18n(TEXT.deleteFailedReason, name, reason),
  );
}

function nameOf(targets: readonly DeletablePrincipal[], key: PrincipalKey): string {
  return targets.find((target) => target.key === key)?.displayName ?? key;
}
