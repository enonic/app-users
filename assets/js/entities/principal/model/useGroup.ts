import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import type { DetailState } from '../../../shared/detail';
import { $groupDetail, showGroup } from './group-detail.load';
import type { GroupDetail } from './principal.types';

/**
 * The group the details panel shows, with its members and roles. The key is a plain string because it
 * arrives from the route: it is a `PrincipalKey` only once a group answers to it.
 */
export function useGroup(key: string | undefined): DetailState<GroupDetail> {
  const state = useStore($groupDetail);

  useEffect(() => {
    showGroup(key);
  }, [key]);

  return state;
}
