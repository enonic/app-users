import { map } from 'nanostores';
import type { Result } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import type { Role } from './principal.types';

export type RolesState = {
  status: 'loading' | 'ready' | 'error';
  items: readonly Role[];
  error?: string;
};

export const $roles = map<RolesState>({ status: 'loading', items: [] });

/**
 * The store holds the roles and nothing else — no request, no cancelling.
 *
 * Roles never arrive alone: the section also needs the id providers that name a member's origin and the
 * projects that name a role's bucket, and all three travel in one document. So the screen owns the load
 * and hands the outcome over here — `pages/roles/model/roles.screen.ts`.
 */
export function beginRolesLoad(): void {
  $roles.setKey('status', 'loading');
}

export function receiveRoles(result: Result<Role[], AppError>): void {
  result.match(
    (items) => $roles.set({ status: 'ready', items }),
    (error) => $roles.set({ status: 'error', items: [], error: error.message }),
  );
}
