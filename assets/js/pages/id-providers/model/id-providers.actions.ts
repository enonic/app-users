import type { IdProvider } from '../../../entities/principal';
import { openIdProviderEditor } from '../../../features/idprovider-editor';
import { isAdministrator } from '../../../shared/config';
import {
  type ActionContext,
  actionTargets,
  type SectionAction,
} from '../../../widgets/browse-toolbar/actions';
import { idProvidersDeletion } from './deletion.store';

const SYSTEM_PROVIDER_KEY = 'system';

/**
 * ! The guard that matters: `deleteIdProvider` deletes the provider's node path recursively, and all it
 * ! refuses is the system provider and a caller who is no administrator — so every user and group under
 * ! any other provider goes too. The counts decide, never the loaded rows — the list takes totals
 * ! without fetching anyone.
 */
function deletable(ctx: ActionContext<IdProvider>): boolean {
  const targets = actionTargets(ctx);
  return (
    isAdministrator() &&
    targets.length > 0 &&
    targets.every(
      ({ key, users, groups }) =>
        key !== SYSTEM_PROVIDER_KEY && users.total === 0 && groups.total === 0,
    )
  );
}

export const ID_PROVIDER_ACTIONS: readonly SectionAction<IdProvider>[] = [
  {
    id: 'new',
    labelKey: 'idProviders.action.new',
    shortcut: { code: 'KeyN', alt: true },
    enabled: isAdministrator,
    run: () => openIdProviderEditor({ mode: 'create' }),
  },
  {
    id: 'delete',
    labelKey: 'idProviders.action.delete',
    shortcut: { code: 'Delete', mod: true },
    enabled: deletable,
    run: (ctx) => idProvidersDeletion.open(actionTargets(ctx)),
  },
];
