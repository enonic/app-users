import type { Group } from '../../../entities/principal';
import { openGroupCreator, openGroupEditor } from '../../../features/group-editor';
import { actionTargets, type SectionAction } from '../../../widgets/browse-toolbar/actions';
import { groupsDeletion } from './deletion.store';

// ? No platform-owned groups to protect: `isSystem()` in lib-admin-ui covers system users and
// ? system or project roles, never groups. Whether `group:system:administrators` should be
// ? undeletable is a product question, not one the platform answers.
export const GROUP_ACTIONS: readonly SectionAction<Group>[] = [
  {
    id: 'new',
    labelKey: 'groups.action.new',
    enabled: () => true,
    run: openGroupCreator,
  },
  {
    id: 'edit',
    labelKey: 'groups.action.edit',
    enabled: (ctx) => actionTargets(ctx).length === 1,
    activatedByRow: true,
    run: (ctx) => {
      const [target] = actionTargets(ctx);
      if (target !== undefined) {
        openGroupEditor(target);
      }
    },
  },
  {
    id: 'delete',
    labelKey: 'groups.action.delete',
    enabled: (ctx) => actionTargets(ctx).length > 0,
    run: (ctx) => groupsDeletion.open(actionTargets(ctx)),
  },
];
