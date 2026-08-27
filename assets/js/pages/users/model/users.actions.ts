import { isSystemUser, type User } from '../../../entities/principal';
import { openUserCreator, openUserEditor } from '../../../features/user-editor';
import { actionTargets, type SectionAction } from '../../../widgets/browse-toolbar/actions';
import { usersDeletion } from './deletion.store';

// ? `su` and `anonymous` belong to the platform — `isSystem()` in lib-admin-ui refuses exactly
// ? those two — so Delete leaves them alone.
export const USER_ACTIONS: readonly SectionAction<User>[] = [
  {
    id: 'new',
    labelKey: 'users.action.new',
    enabled: () => true,
    run: openUserCreator,
  },
  {
    id: 'edit',
    labelKey: 'users.action.edit',
    enabled: (ctx) => actionTargets(ctx).length === 1,
    activatedByRow: true,
    run: (ctx) => {
      const [target] = actionTargets(ctx);
      if (target !== undefined) {
        openUserEditor(target);
      }
    },
  },
  {
    id: 'delete',
    labelKey: 'users.action.delete',
    enabled: (ctx) => {
      const targets = actionTargets(ctx);
      return targets.length > 0 && targets.every(({ key }) => !isSystemUser(key));
    },
    run: (ctx) => usersDeletion.open(actionTargets(ctx)),
  },
];
