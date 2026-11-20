import type { Group } from '../../../entities/principal';
import { openGroupEditor } from '../../../features/group-editor';
import { actionTargets, type SectionAction } from '../../../widgets/browse-toolbar/actions';
import { groupsDeletion } from './deletion.store';

// ? No platform-owned groups to protect: `isSystem()` in lib-admin-ui covers system users and
// ? system or project roles, never groups. Whether `group:system:administrators` should be
// ? undeletable is a product question, not one the platform answers.
const NOBODY: ReadonlySet<string> = new Set();

/**
 * `canCreate` is whether any provider takes a new group, and `adminOnly` the groups the caller may not
 * delete because they hold the administrator role — both read by the section, so the actions stay pure.
 */
export function createGroupActions(
  canCreate: boolean,
  adminOnly: ReadonlySet<string> = NOBODY,
): readonly SectionAction<Group>[] {
  return [
    {
      id: 'new',
      labelKey: 'groups.action.new',
      shortcut: { code: 'KeyN', alt: true },
      enabled: () => canCreate,
      run: () => openGroupEditor({ mode: 'create' }),
    },
    {
      id: 'delete',
      labelKey: 'groups.action.delete',
      shortcut: { code: 'Delete', mod: true },
      enabled: (ctx) => {
        const targets = actionTargets(ctx);
        return targets.length > 0 && targets.every(({ key }) => !adminOnly.has(key));
      },
      run: (ctx) => groupsDeletion.open(actionTargets(ctx)),
    },
  ];
}
