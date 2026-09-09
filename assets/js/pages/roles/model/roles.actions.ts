import { isReservedRole, type Role } from '../../../entities/principal';
import { openRoleEditor } from '../../../features/role-editor';
import {
  type ActionContext,
  actionTargets,
  type SectionAction,
} from '../../../widgets/browse-toolbar/actions';
import { rolesDeletion } from './deletion.store';

function deletable(ctx: ActionContext<Role>): boolean {
  const targets = actionTargets(ctx);
  return targets.length > 0 && targets.every(({ key }) => !isReservedRole(key));
}

export const ROLE_ACTIONS: readonly SectionAction<Role>[] = [
  {
    id: 'new',
    labelKey: 'roles.action.new',
    enabled: () => true,
    run: () => openRoleEditor({ mode: 'create' }),
  },
  {
    id: 'edit',
    labelKey: 'roles.action.edit',
    enabled: (ctx) => actionTargets(ctx).length === 1,
    activatedByRow: true,
    run: (ctx) => {
      const [target] = actionTargets(ctx);
      if (target !== undefined) {
        openRoleEditor({ mode: 'edit', entity: target });
      }
    },
  },
  {
    id: 'delete',
    labelKey: 'roles.action.delete',
    enabled: deletable,
    run: (ctx) => rolesDeletion.open(actionTargets(ctx)),
  },
];
