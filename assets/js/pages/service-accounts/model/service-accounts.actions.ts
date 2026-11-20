import { isSystemUser, type User } from '../../../entities/principal';
import { openServiceAccountEditor } from '../../../features/user-editor';
import { actionTargets, type SectionAction } from '../../../widgets/browse-toolbar/actions';
import { serviceAccountsDeletion } from './deletion.store';

const NOBODY: ReadonlySet<string> = new Set();

// ? `su` and `anonymous` live in the system store too, and they belong to the platform — so Delete
// ? leaves them alone, exactly as on the Users screen.
/** `adminOnly` are the accounts the caller may not delete because they hold the administrator role. */
export function createServiceAccountActions(
  adminOnly: ReadonlySet<string> = NOBODY,
): readonly SectionAction<User>[] {
  return [
    {
      id: 'new',
      labelKey: 'serviceAccounts.action.new',
      shortcut: { code: 'KeyN', alt: true },
      enabled: () => true,
      run: () => openServiceAccountEditor({ mode: 'create' }),
    },
    {
      id: 'delete',
      labelKey: 'serviceAccounts.action.delete',
      shortcut: { code: 'Delete', mod: true },
      enabled: (ctx) => {
        const targets = actionTargets(ctx);
        return (
          targets.length > 0 &&
          targets.every(({ key }) => !isSystemUser(key) && !adminOnly.has(key))
        );
      },
      run: (ctx) => serviceAccountsDeletion.open(actionTargets(ctx)),
    },
  ];
}
