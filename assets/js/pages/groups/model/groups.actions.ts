import type { Group } from '../../../entities/principal';
import { openGroupEditor } from '../../../features/group-editor';
import { actionTargets, type SectionAction } from '../../../widgets/browse-toolbar/actions';
import { groupsDeletion } from './deletion.store';

// ? No platform-owned groups to protect: `isSystem()` in lib-admin-ui covers system users and
// ? system or project roles, never groups. Whether `group:system:administrators` should be
// ? undeletable is a product question, not one the platform answers.
/** `canCreate` is whether any provider takes a new group, read by the section so the actions stay pure. */
export function createGroupActions(canCreate: boolean): readonly SectionAction<Group>[] {
  return [
    {
      id: 'new',
      labelKey: 'groups.action.new',
      enabled: () => canCreate,
      run: () => openGroupEditor({ mode: 'create' }),
    },
    {
      id: 'delete',
      labelKey: 'groups.action.delete',
      enabled: (ctx) => actionTargets(ctx).length > 0,
      run: (ctx) => groupsDeletion.open(actionTargets(ctx)),
    },
  ];
}
