import type { UserDraft } from '../../../entities/principal';
import type { UserForm } from './user-form';

/**
 * The form as the create mutation wants it: principals flattened to their keys, and the fields the
 * wizard keeps for itself left behind.
 *
 * ? `clearPassword` is one of those — it only ever says "wipe what the user already has", which a
 * ? user being created does not. Trimming stays in `createUser`, so both editors trim alike.
 */
export function userDraftFrom(form: UserForm): UserDraft {
  return {
    idProvider: form.idProvider,
    name: form.name,
    displayName: form.displayName,
    email: form.email,
    password: form.password,
    roles: form.roles.map(({ key }) => key),
    groups: form.groups.map(({ key }) => key),
  };
}
