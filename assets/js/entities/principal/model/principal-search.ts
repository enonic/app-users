import type { PrincipalPage, PrincipalRef } from './principal.types';

export type PrincipalSearchState = {
  status: 'loading' | 'ready' | 'error';
  principals: readonly PrincipalRef[];
  total: number;
  next: number;
  more: boolean;
  appending: boolean;
  error?: string;
};

export const PRINCIPAL_SEARCH_PAGE = 20;

export const IDLE_PRINCIPAL_SEARCH: PrincipalSearchState = {
  status: 'ready',
  principals: [],
  total: 0,
  next: 0,
  more: false,
  appending: false,
};

export function beginPrincipalSearch(state: PrincipalSearchState): PrincipalSearchState {
  return { ...state, status: 'loading', appending: false, error: undefined };
}

export function receivePrincipalSearch(page: PrincipalPage): PrincipalSearchState {
  const next = page.items.length;

  return {
    status: 'ready',
    principals: page.items,
    total: page.total,
    next,
    more: next > 0 && next < page.total,
    appending: false,
  };
}

export function failPrincipalSearch(message: string): PrincipalSearchState {
  return { ...IDLE_PRINCIPAL_SEARCH, status: 'error', error: message };
}

export function principalSearchAppendStart(state: PrincipalSearchState): number | undefined {
  const settled = state.status === 'ready' && !state.appending && state.error === undefined;

  return settled && state.more ? state.next : undefined;
}

export function beginPrincipalSearchAppend(state: PrincipalSearchState): PrincipalSearchState {
  return { ...state, appending: true };
}

export function appendPrincipalSearch(
  state: PrincipalSearchState,
  page: PrincipalPage,
): PrincipalSearchState {
  const known = new Set(state.principals.map(({ key }) => key));
  const added = page.items.filter(({ key }) => !known.has(key));
  const next = state.next + page.items.length;

  return {
    ...state,
    principals: [...state.principals, ...added],
    total: page.total,
    next,
    more: added.length > 0 && next < page.total,
    appending: false,
  };
}

export function failPrincipalSearchAppend(
  state: PrincipalSearchState,
  message: string,
): PrincipalSearchState {
  return { ...state, appending: false, error: message };
}
