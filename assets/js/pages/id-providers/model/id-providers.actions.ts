import type { IdProvider } from '../../../entities/principal';
import { openIdProviderCreator, openIdProviderEditor } from '../../../features/idprovider-editor';
import {
  type ActionContext,
  actionTargets,
  type SectionAction,
} from '../../../widgets/browse-toolbar/actions';
import { idProvidersDeletion } from './deletion.store';

const SYSTEM_PROVIDER_KEY = 'system';

/**
 * ! The only guard there is: `deleteIdProvider` deletes the provider's node path recursively and refuses
 * ! nothing, so every user and group under it goes too. The counts decide, never the loaded rows — the
 * ! list takes totals without fetching anyone.
 */
function deletable(ctx: ActionContext<IdProvider>): boolean {
  const targets = actionTargets(ctx);
  return (
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
    enabled: () => true,
    run: openIdProviderCreator,
  },
  {
    id: 'edit',
    labelKey: 'idProviders.action.edit',
    enabled: (ctx) => actionTargets(ctx).length === 1,
    activatedByRow: true,
    run: (ctx) => {
      const [target] = actionTargets(ctx);
      if (target !== undefined) {
        openIdProviderEditor(target);
      }
    },
  },
  {
    id: 'delete',
    labelKey: 'idProviders.action.delete',
    enabled: deletable,
    run: (ctx) => idProvidersDeletion.open(actionTargets(ctx)),
  },
];
