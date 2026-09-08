import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import { $roleEditDetail } from './role-edit-detail';
import { $roleEditor, seedRoleEditorMembers } from './role-editor.store';

/** Fills the Members step from the read of the role being edited, once it answers for that role. */
export function useRoleEditorMembers(): void {
  const { entity } = useStore($roleEditor, { keys: ['entity'] });
  const { item } = useStore($roleEditDetail);

  const target = entity?.key;
  const loaded = item?.key === target ? item : undefined;

  useEffect(() => {
    if (loaded !== undefined) {
      seedRoleEditorMembers(loaded.members);
    }
  }, [loaded]);
}
