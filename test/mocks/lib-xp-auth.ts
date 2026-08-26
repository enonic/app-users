import type {
  ChangePasswordParams,
  CreateGroupParams,
  CreateIdProviderParams,
  CreateRoleParams,
  CreateUserParams,
  FindPrincipalsParams,
  FindPrincipalsResult,
  FindUsersParams,
  Group,
  GroupKey,
  IdProvider,
  ModifyGroupParams,
  ModifyRoleParams,
  ModifyUserParams,
  PrincipalKey,
  Principal,
  Role,
  RoleKey,
  User,
  UserKey,
} from '@enonic-types/lib-auth';
import { vi } from 'vitest';

export const hasRole = vi.fn<(role: string) => boolean>();

export const getIdProviders = vi.fn<() => IdProvider[]>();

export const findPrincipals = vi.fn<(params: FindPrincipalsParams) => FindPrincipalsResult>();

export const getMembers = vi.fn<(principalKey: GroupKey | RoleKey) => (User | Group)[]>();

export const getMemberships =
  vi.fn<(principalKey: GroupKey | UserKey, transitive?: boolean) => (Group | Role)[]>();

export const findUsers = vi.fn<(params: FindUsersParams) => FindPrincipalsResult<User>>();

export const getPrincipal = vi.fn<(key: PrincipalKey) => Principal | null>();

export const getProfile = vi.fn<(params: { key: string; scope?: string }) => unknown>();

export const modifyProfile =
  vi.fn<
    (params: { key: string; scope?: string; editor: (profile: never) => unknown }) => unknown
  >();

export const deletePrincipal = vi.fn<(principalKey: PrincipalKey) => boolean>();

export const createUser = vi.fn<(params: CreateUserParams) => User>();

export const modifyUser = vi.fn<(params: ModifyUserParams) => User | null>();

export const createGroup = vi.fn<(params: CreateGroupParams) => Group>();

export const modifyGroup = vi.fn<(params: ModifyGroupParams) => Group | null>();

export const createRole = vi.fn<(params: CreateRoleParams) => Role>();

export const modifyRole = vi.fn<(params: ModifyRoleParams) => Role | null>();

export const addMembers =
  vi.fn<(principalKey: GroupKey | RoleKey, members: (UserKey | GroupKey)[]) => void>();

export const removeMembers =
  vi.fn<(principalKey: GroupKey | RoleKey, members: (UserKey | GroupKey)[]) => void>();

export const changePassword = vi.fn<(params: ChangePasswordParams) => void>();

export const generatePassword = vi.fn<() => string>();

export const createIdProvider = vi.fn<(params: CreateIdProviderParams) => IdProvider>();
