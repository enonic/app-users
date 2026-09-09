import {
  fetchIdProviderPermissions,
  type IdProviderPermissions,
} from '../../../entities/principal';
import { createDetailLoader } from '../../../shared/detail';

// The list is the provider's own read: no list query carries it, so the editor fetches it on open.
const loader = createDetailLoader<IdProviderPermissions>({ load: fetchIdProviderPermissions });

export const $idProviderEditDetail = loader.$detail;

export const showIdProviderForEdit = loader.show;

// ! The cache outlives the dialog, so a provider saved and reopened would be seeded from the permissions
// ! it had before the save. `forget` rather than `invalidate`: it clears without re-emitting `show`,
// ! which would overwrite what the user has picked.
export const forgetIdProviderEditDetail = loader.forget;
