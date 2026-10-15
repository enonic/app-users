import { atom, type ReadableAtom } from 'nanostores';

/**
 * Whether the provider already holds the name a wizard is being given.
 *
 * `error` is the check that could not be made — a request that failed. It blocks nothing and shows
 * nothing: an outage must not strand the user on the first step, and the create command refuses the
 * duplicate anyway.
 */
export type PrincipalNameCheckStatus = 'idle' | 'pending' | 'available' | 'taken' | 'error';

export type PrincipalNameCheckState = {
  status: PrincipalNameCheckStatus;
  /** The key the status describes, absent while idle. */
  key?: string;
};

export type PrincipalNameCheckStore = {
  $state: ReadableAtom<PrincipalNameCheckState>;
  begin: (key: string) => void;
  receive: (key: string, taken: boolean) => void;
  fail: (key: string) => void;
  idle: () => void;
};

export function createPrincipalNameCheckStore(): PrincipalNameCheckStore {
  const $state = atom<PrincipalNameCheckState>({ status: 'idle' });

  return {
    $state,
    begin: (key) => $state.set({ status: 'pending', key }),
    receive: (key, taken) => $state.set({ status: taken ? 'taken' : 'available', key }),
    fail: (key) => $state.set({ status: 'error', key }),
    idle: () => $state.set({ status: 'idle' }),
  };
}
