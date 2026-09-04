import { map } from 'nanostores';
import type { Result } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import type { Repository } from './repository.types';

export type RepositoriesState = {
  status: 'loading' | 'ready' | 'error';
  items: readonly Repository[];
  error?: string;
};

/** One list for the module, so the four sections mounted from it ask for it once between them. */
export const $repositories = map<RepositoriesState>({ status: 'loading', items: [] });

export function beginRepositoriesLoad(): void {
  $repositories.set({ status: 'loading', items: [] });
}

export function receiveRepositories(result: Result<Repository[], AppError>): void {
  result.match(
    (items) => $repositories.set({ status: 'ready', items }),
    (error) => $repositories.set({ status: 'error', items: [], error: error.message }),
  );
}
