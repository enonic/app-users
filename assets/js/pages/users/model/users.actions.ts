import { isSystemUser, type User } from '../../../entities/principal';
import { openUserEditor } from '../../../features/user-editor';
import { actionTargets, type SectionAction } from '../../../widgets/browse-toolbar/actions';
import { usersDeletion } from './deletion.store';

const NOBODY: ReadonlySet<string> = new Set();

/**
 * `canCreate` is whether any provider takes a new user — the section reads it from the providers, so the
 * actions stay pure. `su` and `anonymous` belong to the platform — `isSystem()` in lib-admin-ui refuses
 * exactly those two — so Delete leaves them alone; it reads no mode, as legacy did not. `adminOnly` are
 * the users the caller may not delete because they hold the administrator role, read by the section too.
 */
export function createUserActions(
  canCreate: boolean,
  adminOnly: ReadonlySet<string> = NOBODY,
): readonly SectionAction<User>[] {
  return [
    {
      id: 'new',
      labelKey: 'users.action.new',
      shortcut: { code: 'KeyN', alt: true },
      enabled: () => canCreate,
      run: () => openUserEditor({ mode: 'create' }),
    },
    {
      id: 'delete',
      labelKey: 'users.action.delete',
      shortcut: { code: 'Delete', mod: true },
      enabled: (ctx) => {
        const targets = actionTargets(ctx);
        return (
          targets.length > 0 &&
          targets.every(({ key }) => !isSystemUser(key) && !adminOnly.has(key))
        );
      },
      run: (ctx) => usersDeletion.open(actionTargets(ctx)),
    },
  ];
}
