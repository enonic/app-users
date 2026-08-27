import type { ResultAsync } from 'neverthrow';
import { useEffect, useState } from 'preact/hooks';

import type { AppError } from '../../../shared/api';
import { fetchGroupMemberships } from '../api/groups.api';
import { fetchUserDetail } from '../api/users.api';
import type { Memberships, PrincipalRef } from './principal.types';

export type TransitiveMemberships = Memberships & {
  status: 'idle' | 'loading' | 'ready' | 'error';
};

const EMPTY: readonly PrincipalRef[] = [];

const READS: Record<
  'user' | 'group',
  (key: string, signal: AbortSignal) => ResultAsync<Memberships | undefined, AppError>
> = {
  user: (key, signal) => fetchUserDetail(key, true, signal),
  group: (key, signal) => fetchGroupMemberships(key, true, signal),
};

export function useTransitiveMemberships(
  key: string,
  type: 'user' | 'group',
  enabled: boolean,
): TransitiveMemberships {
  const [state, setState] = useState<TransitiveMemberships>({
    status: 'idle',
    roles: EMPTY,
    groups: EMPTY,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ status: 'idle', roles: EMPTY, groups: EMPTY });
      return;
    }

    setState((current) => ({ ...current, status: 'loading' }));

    const controller = new AbortController();

    void READS[type](key, controller.signal).match(
      (memberships) => {
        if (controller.signal.aborted) {
          return;
        }

        setState(
          memberships === undefined
            ? { status: 'error', roles: EMPTY, groups: EMPTY }
            : { status: 'ready', roles: memberships.roles, groups: memberships.groups },
        );
      },
      () => {
        if (!controller.signal.aborted) {
          setState({ status: 'error', roles: EMPTY, groups: EMPTY });
        }
      },
    );

    return () => controller.abort();
  }, [key, type, enabled]);

  return state;
}
