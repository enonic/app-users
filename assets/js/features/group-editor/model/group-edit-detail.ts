import { fetchGroupDetail, type GroupDetail } from '../../../entities/principal';
import { createDetailLoader } from '../../../shared/detail';

// ! Only what is set on the group itself can be written back, so the editor prefills from the direct read.
const loader = createDetailLoader<GroupDetail>({
  load: (key, signal) => fetchGroupDetail(key, false, signal),
});

export const $groupEditDetail = loader.$detail;

export const showGroupForEdit = loader.show;

// ! The cache outlives the dialog, so a group saved and reopened would be seeded from the lists it had
// ! before the save. `forget` rather than `invalidate`: it clears without re-emitting `show`, which
// ! would overwrite what the user has typed.
export const forgetGroupEditDetail = loader.forget;
