import type { RoleDraft } from '../../../entities/principal';
import type { RoleForm } from './role-form';

/**
 * The form as the create mutation wants it: members flattened to their keys, and the field the wizard
 * keeps for itself left behind. Trimming stays in `createRole`.
 */
export function roleDraftFrom(form: RoleForm): RoleDraft {
  return {
    name: form.name,
    displayName: form.displayName,
    description: form.description,
    members: form.members.map(({ key }) => key),
  };
}
