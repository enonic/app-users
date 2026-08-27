import type { ResultAsync } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import { notifyError } from '../../../shared/host';
import { i18n } from '../../../shared/i18n';
import type { SelectionStore } from '../../../shared/selection';
import {
  sendIdProviderCreation,
  sendIdProviderDeletion,
  sendIdProviderUpdate,
  type IdProviderInput,
} from '../api/id-providers.api';
import type { IdProvider, IdProviderPermission } from './principal.types';

const TEXT = {
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
 * fail on: the confirmation closes first, and what is left to say is one notification per refusal.
 */
export async function deleteIdProviders(
  targets: readonly DeletableIdProvider[],
  scope: IdProviderSectionScope,
): Promise<void> {
  if (targets.length === 0) {
    return;
  }

  const result = await sendIdProviderDeletion(targets.map(({ key }) => key));

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

function notifyFailure(name: string, reason: string | undefined): void {
  notifyError(
    reason === undefined
      ? i18n(TEXT.deleteFailed, name)
      : i18n(TEXT.deleteFailedReason, name, reason),
  );
}

function nameOf(targets: readonly DeletableIdProvider[], key: string): string {
  return targets.find((target) => target.key === key)?.displayName ?? key;
}
