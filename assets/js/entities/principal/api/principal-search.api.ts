import type { ResultAsync } from 'neverthrow';

import { requestGraphQlDocument, type AppError } from '../../../shared/api';
import type { PrincipalKey, PrincipalRef } from '../model/principal.types';

const USER_SEARCH_DOCUMENT = `
  query PrincipalSearchUsers($search: String, $count: Int) {
    users(search: $search, count: $count) {
      hits {
        key
        displayName
      }
    }
  }
`;

const GROUP_SEARCH_DOCUMENT = `
  query PrincipalSearchGroups {
    groups {
      key
      displayName
    }
  }
`;

const ROLE_SEARCH_DOCUMENT = `
  query PrincipalSearchRoles {
    roles {
      key
      displayName
    }
  }
`;

type PrincipalHitDto = {
  key: string;
  displayName: string;
};

type UserSearchResult = {
  users: { hits: PrincipalHitDto[] } | null;
};

type GroupSearchResult = {
  groups: PrincipalHitDto[] | null;
};

type RoleSearchResult = {
  roles: PrincipalHitDto[] | null;
};

export function searchUsers(
  search: string,
  count: number,
  signal?: AbortSignal,
): ResultAsync<PrincipalRef[], AppError> {
  return requestGraphQlDocument<UserSearchResult>(
    USER_SEARCH_DOCUMENT,
    { search: search.length > 0 ? search : undefined, count },
    signal,
  ).map((data) => (data.users?.hits ?? []).map((hit) => toRef(hit, 'user')));
}

export function fetchGroupRefs(signal?: AbortSignal): ResultAsync<PrincipalRef[], AppError> {
  return requestGraphQlDocument<GroupSearchResult>(GROUP_SEARCH_DOCUMENT, {}, signal).map((data) =>
    (data.groups ?? []).map((hit) => toRef(hit, 'group')),
  );
}

export function fetchRoleRefs(signal?: AbortSignal): ResultAsync<PrincipalRef[], AppError> {
  return requestGraphQlDocument<RoleSearchResult>(ROLE_SEARCH_DOCUMENT, {}, signal).map((data) =>
    (data.roles ?? []).map((hit) => toRef(hit, 'role')),
  );
}

function toRef({ key, displayName }: PrincipalHitDto, type: PrincipalRef['type']): PrincipalRef {
  return { key: key as PrincipalKey, type, displayName };
}
