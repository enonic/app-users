import { fetchRoleDetail, type RoleDetail } from '../../../entities/principal';
import { createDetailLoader } from '../../../shared/detail';

const loader = createDetailLoader<RoleDetail>({ load: fetchRoleDetail });

export const $roleEditDetail = loader.$detail;

export const showRoleForEdit = loader.show;

// ! The cache outlives the dialog, so a role saved and reopened would be seeded from the member list it
// ! had before the save. `forget` rather than `invalidate`: it clears without re-emitting `show`, which
// ! would overwrite what the user has typed.
export const forgetRoleEditDetail = loader.forget;
