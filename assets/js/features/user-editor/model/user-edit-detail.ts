import { fetchUserDetail, type UserDetail } from '../../../entities/principal';
import { createDetailLoader } from '../../../shared/detail';

// ! Only what is set on the user itself can be written back, so the editor prefills from the direct read.
const loader = createDetailLoader<UserDetail>({
  load: (key, signal) => fetchUserDetail(key, false, signal),
});

export const $userEditDetail = loader.$detail;

export const showUserForEdit = loader.show;

// ! The cache outlives the dialog, so a user saved and reopened would be seeded from the roles, groups and
// ! public keys held before the save. `forget` rather than `invalidate`: it clears without re-emitting
// ! `show`, which would overwrite what the user has typed.
export const forgetUserEditDetail = loader.forget;
