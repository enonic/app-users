import type { ResultAsync } from 'neverthrow';

import { requestGraphQl, type AppError, type GraphQlRoot } from '../../../shared/api';
import type { Repository } from '../model/repository.types';

export const REPOSITORIES_ROOT: GraphQlRoot = {
  field: 'repositories',
  selection: `{
    id
    branches
  }`,
};

type RepositoryDto = {
  id: string;
  branches: string[];
};

type RepositoriesData = { repositories: RepositoryDto[] };

/**
 * The repositories a permission report can be generated from.
 *
 * ! Null for anyone but a system administrator, and the transport reads a null root as a failure —
 * ! which is right here, because nothing asks for this list unless `config.admin` already said yes.
 */
export function fetchRepositories(signal?: AbortSignal): ResultAsync<Repository[], AppError> {
  return requestGraphQl<RepositoriesData>(REPOSITORIES_ROOT, { signal }).map(({ repositories }) =>
    repositories.map(toRepository),
  );
}

//
// * Helpers
//

function toRepository(dto: RepositoryDto): Repository {
  return { id: dto.id, branches: dto.branches };
}
