import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import type { DetailState } from '../../../shared/detail';
import type { RoleDetail } from './principal.types';
import { $roleDetail, showRole } from './role-detail.load';

/**
 * The role the details panel shows, members included. The key is a plain string because it arrives from
 * the route: it is a `PrincipalKey` only once a role answers to it.
 */
export function useRole(key: string | undefined): DetailState<RoleDetail> {
  const state = useStore($roleDetail);

  useEffect(() => {
    showRole(key);
  }, [key]);

  return state;
}
