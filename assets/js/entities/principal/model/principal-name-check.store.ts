import { atom } from 'nanostores';

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

export const $principalNameCheck = atom<PrincipalNameCheckState>({ status: 'idle' });

export function beginPrincipalNameCheck(key: string): void {
  $principalNameCheck.set({ status: 'pending', key });
}

export function receivePrincipalNameCheck(key: string, taken: boolean): void {
  $principalNameCheck.set({ status: taken ? 'taken' : 'available', key });
}

export function failPrincipalNameCheck(key: string): void {
  $principalNameCheck.set({ status: 'error', key });
}

export function idlePrincipalNameCheck(): void {
  $principalNameCheck.set({ status: 'idle' });
}
