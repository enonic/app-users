import { i18n } from '../../../shared/i18n';
import type { SelectionStore } from '../../../shared/selection';
import { sendPrincipalDeletion } from '../api/principal-deletion.api';
import type { PrincipalKey } from './principal.types';

const TEXT = {
  deleted: 'principal.notify.deleted',
  deletedMany: 'principal.notify.deletedMany',
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

/**
 * What the command has to say, localized and in showing order. What to say is the domain's — the
 * names, the counts, the phrases; where to say it is the caller's, through its own mount's frame.
 * A command never reaches the host.
 */
export type DeletionNotices = {
  /** The one deleted principal by name, several as a count. Absent when nothing was deleted. */
  success?: string;
  /**
   * One refusal per target that stayed. Shown after the success: errors live longer and only three
   * toasts show, so raised before a batch of refusals the confirmation would queue behind them.
   */
  failures: string[];
};

export async function deletePrincipals(
  targets: readonly DeletablePrincipal[],
  scope: PrincipalSectionScope,
): Promise<DeletionNotices> {
  if (targets.length === 0) {
    return { failures: [] };
  }

  const result = await sendPrincipalDeletion(targets.map(({ key }) => key));

  return result.match(
    (outcomes) => {
      const deletedKeys = outcomes.filter(({ deleted }) => deleted).map(({ key }) => key);

      reconcile(deletedKeys, scope);

      return {
        success: successMessage(deletedKeys, targets),
        failures: outcomes
          .filter(({ deleted }) => !deleted)
          .map(({ key, reason }) => failureMessage(nameOf(targets, key), reason)),
      };
    },
    (error) => ({
      failures: targets.map(({ displayName }) => failureMessage(displayName, error.message)),
    }),
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

/** A deleted row just leaves the list, so the toast is what says the command worked. */
function successMessage(
  keys: readonly PrincipalKey[],
  targets: readonly DeletablePrincipal[],
): string | undefined {
  const [only] = keys;

  if (keys.length === 1 && only !== undefined) {
    return i18n(TEXT.deleted, nameOf(targets, only));
  }

  return keys.length > 1 ? i18n(TEXT.deletedMany, keys.length) : undefined;
}

function failureMessage(name: string, reason: string | undefined): string {
  return reason === undefined
    ? i18n(TEXT.deleteFailed, name)
    : i18n(TEXT.deleteFailedReason, name, reason);
}

function nameOf(targets: readonly DeletablePrincipal[], key: PrincipalKey): string {
  return targets.find((target) => target.key === key)?.displayName ?? key;
}
