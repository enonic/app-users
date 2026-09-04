import { isSystemUser, type User } from '../../../entities/principal';
import { openServiceAccountCreator, openServiceAccountEditor } from '../../../features/user-editor';
import { actionTargets, type SectionAction } from '../../../widgets/browse-toolbar/actions';
import { serviceAccountsDeletion } from './deletion.store';

// ? `su` and `anonymous` live in the system store too, and they belong to the platform — so Delete
// ? leaves them alone, exactly as on the Users screen.
export const SERVICE_ACCOUNT_ACTIONS: readonly SectionAction<User>[] = [
  {
    id: 'new',
    labelKey: 'serviceAccounts.action.new',
    enabled: () => true,
    run: openServiceAccountCreator,
  },
  {
    id: 'edit',
    labelKey: 'serviceAccounts.action.edit',
    enabled: (ctx) => actionTargets(ctx).length === 1,
    activatedByRow: true,
    run: (ctx) => {
      const [target] = actionTargets(ctx);
      if (target !== undefined) {
        openServiceAccountEditor(target);
      }
    },
  },
  {
    id: 'delete',
    labelKey: 'serviceAccounts.action.delete',
    enabled: (ctx) => {
      const targets = actionTargets(ctx);
      return targets.length > 0 && targets.every(({ key }) => !isSystemUser(key));
    },
    run: (ctx) => serviceAccountsDeletion.open(actionTargets(ctx)),
  },
];
