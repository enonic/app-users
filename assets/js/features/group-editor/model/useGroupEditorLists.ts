import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import { $groupEditDetail } from './group-edit-detail';
import { $groupEditor, seedGroupEditorLists } from './group-editor.store';

/**
 * Fills the Members and Roles steps from the group being edited. The detail the dialog already loads
 * carries both, so this costs no request of its own.
 */
export function useGroupEditorLists(): void {
  const { entity } = useStore($groupEditor, { keys: ['entity'] });
  const { item } = useStore($groupEditDetail);

  const target = entity?.key;
  const loaded = item?.key === target ? item : undefined;

  useEffect(() => {
    if (loaded !== undefined) {
      seedGroupEditorLists({ members: loaded.members, roles: loaded.roles });
    }
  }, [loaded]);
}
