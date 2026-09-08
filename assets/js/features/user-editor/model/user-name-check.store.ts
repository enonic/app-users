import { atom } from 'nanostores';

/**
 * Whether the provider already holds the name the wizard is being given.
 *
 * `error` is the check that could not be made — a request that failed. It blocks nothing and shows
 * nothing: an outage must not strand the user on the first step, and `createUser` refuses the duplicate
 * anyway.
 */
export type UserNameCheckStatus = 'idle' | 'pending' | 'available' | 'taken' | 'error';

export type UserNameCheckState = {
  status: UserNameCheckStatus;
  /** The key the status describes, absent while idle. */
  key?: string;
};

export const $userNameCheck = atom<UserNameCheckState>({ status: 'idle' });

export function beginUserNameCheck(key: string): void {
  $userNameCheck.set({ status: 'pending', key });
}

export function receiveUserNameCheck(key: string, taken: boolean): void {
  $userNameCheck.set({ status: taken ? 'taken' : 'available', key });
}

export function failUserNameCheck(key: string): void {
  $userNameCheck.set({ status: 'error', key });
}

export function idleUserNameCheck(): void {
  $userNameCheck.set({ status: 'idle' });
}
