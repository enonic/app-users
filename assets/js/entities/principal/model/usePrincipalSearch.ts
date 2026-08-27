import { useEffect, useState } from 'preact/hooks';

import { fetchGroupRefs, fetchRoleRefs, searchUsers } from '../api/principal-search.api';
import { matching } from './principal-match';
import type { PrincipalRef, PrincipalType } from './principal.types';

export type PrincipalSearchState = {
  status: 'loading' | 'ready' | 'error';
  /** Matches in the order they are offered: users, then groups, then roles. */
  principals: readonly PrincipalRef[];
  error?: string;
  /** A whole-list kind that could not be loaded, so the offer is short without saying why. */
  incompleteKinds: readonly PrincipalType[];
};

const DEBOUNCE_MS = 250;

const PAGE_SIZE = 20;

const EMPTY: readonly PrincipalRef[] = [];

export function usePrincipalSearch(
  query: string,
  enabled: boolean,
  kinds: readonly PrincipalType[],
): PrincipalSearchState {
  const wantsUsers = kinds.includes('user');
  const wantsGroups = kinds.includes('group');
  const wantsRoles = kinds.includes('role');

  const [users, setUsers] = useState<readonly PrincipalRef[]>(EMPTY);
  const [groups, setGroups] = useState<readonly PrincipalRef[]>(EMPTY);
  const [roles, setRoles] = useState<readonly PrincipalRef[]>(EMPTY);
  const [status, setStatus] = useState<PrincipalSearchState['status']>('ready');
  const [error, setError] = useState<string | undefined>();
  const [groupsFailed, setGroupsFailed] = useState(false);
  const [rolesFailed, setRolesFailed] = useState(false);

  useEffect(() => {
    if (!enabled || !wantsGroups) {
      return;
    }

    const controller = new AbortController();

    void fetchGroupRefs(controller.signal).match(
      (loaded) => {
        if (!controller.signal.aborted) {
          setGroups(loaded);
          setGroupsFailed(false);
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setGroups(EMPTY);
          setGroupsFailed(true);
        }
      },
    );

    return () => controller.abort();
  }, [enabled, wantsGroups]);

  useEffect(() => {
    if (!enabled || !wantsRoles) {
      return;
    }

    const controller = new AbortController();

    void fetchRoleRefs(controller.signal).match(
      (loaded) => {
        if (!controller.signal.aborted) {
          setRoles(loaded);
          setRolesFailed(false);
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setRoles(EMPTY);
          setRolesFailed(true);
        }
      },
    );

    return () => controller.abort();
  }, [enabled, wantsRoles]);

  useEffect(() => {
    if (!enabled || !wantsUsers) {
      setUsers(EMPTY);
      setStatus('ready');
      setError(undefined);
      return;
    }

    setStatus('loading');

    const controller = new AbortController();
    const timer = setTimeout(() => {
      void searchUsers(query, PAGE_SIZE, controller.signal).match(
        (found) => {
          if (!controller.signal.aborted) {
            setUsers(found);
            setStatus('ready');
            setError(undefined);
          }
        },
        (failure) => {
          if (!controller.signal.aborted) {
            setUsers(EMPTY);
            setStatus('error');
            setError(failure.message);
          }
        },
      );
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, enabled, wantsUsers]);

  const incompleteKinds: PrincipalType[] = [];
  if (groupsFailed) {
    incompleteKinds.push('group');
  }
  if (rolesFailed) {
    incompleteKinds.push('role');
  }

  return {
    status,
    principals: [
      ...users,
      ...matching(groups, query).slice(0, PAGE_SIZE),
      ...matching(roles, query).slice(0, PAGE_SIZE),
    ],
    error,
    incompleteKinds,
  };
}
