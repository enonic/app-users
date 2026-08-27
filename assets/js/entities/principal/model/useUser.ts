import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import type { DetailState } from '../../../shared/detail';
import type { UserDetail } from './principal.types';
import { $userDetail, showUser } from './user-detail.load';

/**
 * The user the details panel shows. The key is a plain string because it arrives from the route — it is
 * a `UserKey` only once a user answers to it.
 */
export function useUser(key: string | undefined): DetailState<UserDetail> {
  const state = useStore($userDetail);

  useEffect(() => {
    showUser(key);
  }, [key]);

  return state;
}
