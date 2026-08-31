import type { ResultAsync } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import { i18n } from '../../../shared/i18n';
import type { SelectionStore } from '../../../shared/selection';
import {
  sendIdProviderCreation,
  sendIdProviderDeletion,
  sendIdProviderUpdate,
  type IdProviderInput,
} from '../api/id-providers.api';
import type { DeletionNotices } from './principal-commands';
import type { IdProvider, IdProviderPermission } from './principal.types';

const TEXT = {
  deleted: 'idProviders.notify.deleted',
  deletedMany: 'idProviders.notify.deletedMany',
  deleteFailed: 'idProviders.notify.deleteFailed',
  deleteFailedReason: 'idProviders.notify.deleteFailedReason',
} as const;

/** What the dialog holds: the scalars as typed, the binding as a key, the permissions as a whole list. */
export type IdProviderDraft = {
  name: string;
  displayName: string;
  description: string;
  application: string;
  permissions: readonly IdProviderPermission[];
};

export type DeletableIdProvider = {
  key: string;
  displayName: string;
};

export type IdProviderSectionScope = {
  resync: () => void;
  closeItem: () => void;
  activeKey?: string;
  selection: SelectionStore;
};

/**
 * Both return a `Result` rather than notifying, for the reason `role-commands.ts` gives: the dialog
 * stays open on failure and is the screen the save fails on.
 */
export function createIdProvider(draft: IdProviderDraft): ResultAsync<IdProvider, AppError> {
  return sendIdProviderCreation(draft.name.trim(), toInput(draft));
}

export function updateIdProvider(
  key: string,
  draft: IdProviderDraft,
): ResultAsync<IdProvider, AppError> {
  return sendIdProviderUpdate(key, toInput(draft));
}

/**
 * Deleting is the section's own command rather than a dialog's, because its outcome has no screen to
 * fail on: the confirmation closes first, and what is left to say is answered as localized
 * `DeletionNotices` for the caller's own toast stack, as `principal-commands.ts` does.
 */
export async function deleteIdProviders(
  targets: readonly DeletableIdProvider[],
  scope: IdProviderSectionScope,
): Promise<DeletionNotices> {
  if (targets.length === 0) {
    return { failures: [] };
  }

  const result = await sendIdProviderDeletion(targets.map(({ key }) => key));

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

//
// * Helpers
//

// ! Reloads even when every key was refused, as `principal-commands.ts` does: `deleted: false` also
// ! covers a provider someone else has already deleted, and that one has to leave the list.
function reconcile(
  deletedKeys: readonly string[],
  { resync, closeItem, activeKey, selection }: IdProviderSectionScope,
): void {
  deletedKeys.forEach((key) => selection.toggle(key, false));

  if (activeKey !== undefined && deletedKeys.some((key) => key === activeKey)) {
    closeItem();
  }

  resync();
}

function toInput(draft: IdProviderDraft): IdProviderInput {
  const description = draft.description.trim();
  const application = draft.application.trim();

  return {
    displayName: draft.displayName.trim(),
    description: description.length > 0 ? description : undefined,
    application: application.length > 0 ? application : undefined,
    permissions: draft.permissions.map(({ principal, access }) => ({
      principal: principal.key,
      access,
    })),
  };
}

/** A deleted row just leaves the list, so the toast is what says the command worked. */
function successMessage(
  keys: readonly string[],
  targets: readonly DeletableIdProvider[],
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

function nameOf(targets: readonly DeletableIdProvider[], key: string): string {
  return targets.find((target) => target.key === key)?.displayName ?? key;
}
