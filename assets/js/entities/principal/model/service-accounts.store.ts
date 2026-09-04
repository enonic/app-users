import { createUsersList } from './users-list.store';

/**
 * The Service Accounts section's page of users — the system store's. Its own instance, never the Users
 * section's: the host keeps both sections mounted at once, so a shared list would hand each the other's
 * page. See `users-list.store.ts`.
 */
const list = createUsersList();

export const $serviceAccounts = list.$state;

export const $serviceAccountsHasMore = list.$hasMore;

export const beginServiceAccountsLoad = list.beginLoad;

export const beginServiceAccountsAppend = list.beginAppend;

export const receiveServiceAccounts = list.receive;

export const appendServiceAccounts = list.append;

export const replaceServiceAccount = list.replace;

export const removeServiceAccount = list.remove;

export const serviceAccountsAppendStart = list.appendStart;

export const serviceAccountsLoadedExtent = list.loadedExtent;

export const serviceAccountsLoadedKeys = list.loadedKeys;
