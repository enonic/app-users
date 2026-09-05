import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import { $userEditDetail } from './user-edit-detail';
import { $userEditor, seedUserEditorMemberships } from './user-editor.store';

/**
 * Fills the Roles and Groups steps from the user being edited. The detail the dialog already loads
 * carries both, so this costs no request of its own.
 */
export function useUserEditorMemberships(): void {
  const { user } = useStore($userEditor, { keys: ['user'] });
  const { item } = useStore($userEditDetail);

  const target = user?.key;
  const loaded = item?.key === target ? item : undefined;

  useEffect(() => {
    if (loaded !== undefined) {
      seedUserEditorMemberships({ roles: loaded.roles, groups: loaded.groups });
    }
  }, [loaded]);
}
