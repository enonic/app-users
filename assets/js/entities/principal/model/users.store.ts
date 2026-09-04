import { createUsersList } from './users-list.store';

/**
 * The Users section's page of users. The machinery — and why it is a factory — lives in
 * `users-list.store.ts`; the Service Accounts section holds its own instance in
 * `service-accounts.store.ts`.
 */
const list = createUsersList();

export type { UsersState } from './users-list.store';

export const $users = list.$state;

export const $usersHasMore = list.$hasMore;

export const beginUsersLoad = list.beginLoad;

export const beginUsersAppend = list.beginAppend;

export const receiveUsers = list.receive;

export const appendUsers = list.append;

export const replaceUser = list.replace;

export const removeUser = list.remove;

export const usersAppendStart = list.appendStart;

export const usersLoadedExtent = list.loadedExtent;

export const usersLoadedKeys = list.loadedKeys;
