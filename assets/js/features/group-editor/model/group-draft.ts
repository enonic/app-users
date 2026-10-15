import type { GroupDraft } from '../../../entities/principal';
import type { GroupForm } from './group-form';

/**
 * The form as the create mutation wants it: principals flattened to their keys, and the field the wizard
 * keeps for itself left behind. Trimming stays in `createGroup`.
 */
export function groupDraftFrom(form: GroupForm): GroupDraft {
  return {
    idProvider: form.idProvider,
    name: form.name,
    displayName: form.displayName,
    description: form.description,
    members: form.members.map(({ key }) => key),
    roles: form.roles.map(({ key }) => key),
  };
}
