import { map } from 'nanostores';
import type { Result } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import type { Group } from './principal.types';
import { upsert } from './upsert';

export type GroupsState = {
  status: 'loading' | 'ready' | 'error';
  items: readonly Group[];
  error?: string;
};

export const $groups = map<GroupsState>({ status: 'loading', items: [] });

/**
 * The store holds the groups and nothing else — no request, no cancelling.
 *
 * A group key carries only its provider's name, so the section needs the id providers beside the groups
 * and the two travel in one document. The screen owns that load and hands the outcome over here —
 * `pages/groups/model/groups.screen.ts`.
 */
export function beginGroupsLoad(): void {
  $groups.setKey('status', 'loading');
}

/** Order is the page's business, so a new group is appended. */
export function receiveGroup(group: Group): void {
  $groups.setKey('items', upsert($groups.get().items, group));
}

export function removeGroup(key: string): void {
  const { items } = $groups.get();

  if (items.some((group) => group.key === key)) {
    $groups.setKey(
      'items',
      items.filter((group) => group.key !== key),
    );
  }
}

export function receiveGroups(result: Result<Group[], AppError>): void {
  result.match(
    (items) => $groups.set({ status: 'ready', items }),
    (error) => $groups.set({ status: 'error', items: [], error: error.message }),
  );
}
