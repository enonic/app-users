import { fetchUserDetail, type UserDetail } from '../../../entities/principal';
import { createDetailLoader } from '../../../shared/detail';

// The service-account editor's own prefill, apart from `user-edit-detail.ts`: both dialogs stay
// rendered — one per mounted section — and each `show`s its own edited key into its loader, so sharing
// one would let the idle dialog clear what the open one is seeding from.
const loader = createDetailLoader<UserDetail>({
  load: (key, signal) => fetchUserDetail(key, false, signal),
});

export const $serviceAccountEditDetail = loader.$detail;

export const showServiceAccountForEdit = loader.show;

// ! `forget` rather than `invalidate`, for the same reason as `user-edit-detail.ts`: the cache outlives
// ! the dialog, and re-emitting `show` would overwrite what the user has typed.
export const forgetServiceAccountEditDetail = loader.forget;
