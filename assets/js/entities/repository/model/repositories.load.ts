import { err, ok } from 'neverthrow';

import { fetchRepositories } from '../api/repositories.api';
import { beginRepositoriesLoad, receiveRepositories } from './repositories.store';

// ? No refresh: repositories change in Content Studio, not here. A failure is forgotten so the next
// ? mount asks again.
let started: Promise<void> | undefined;

export function loadRepositories(): Promise<void> {
  started ??= load();

  return started;
}

//
// * Internal
//

function load(): Promise<void> {
  beginRepositoriesLoad();

  return fetchRepositories().match(
    (items) => receiveRepositories(ok(items)),
    (error) => {
      started = undefined;
      receiveRepositories(err(error));
    },
  );
}
