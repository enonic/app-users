import { err, ok } from 'neverthrow';

import { fetchRepositories } from '../api/repositories.api';
import { receiveRepositories } from './repositories.store';

/**
 * ! Once per module instance, and no refresh: repositories are created and deleted by Content Studio,
 * ! not here, and a list that changed under an administrator mid-session would still generate the
 * ! report they asked for. Retrying a failure means reopening the section.
 */
let started: Promise<void> | undefined;

export function loadRepositories(): Promise<void> {
  started ??= fetchRepositories().match(
    (items) => receiveRepositories(ok(items)),
    (error) => receiveRepositories(err(error)),
  );

  return started;
}
