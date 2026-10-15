import { useEffect, useRef, useState } from 'preact/hooks';

import { searchPrincipals } from '../api/principal-search.api';
import {
  appendPrincipalSearch,
  beginPrincipalSearch,
  beginPrincipalSearchAppend,
  failPrincipalSearch,
  failPrincipalSearchAppend,
  IDLE_PRINCIPAL_SEARCH,
  PRINCIPAL_SEARCH_PAGE,
  principalSearchAppendStart,
  receivePrincipalSearch,
  type PrincipalSearchState,
} from './principal-search';
import type { PrincipalType } from './principal.types';

export type PrincipalSearch = PrincipalSearchState & {
  hasMore: boolean;
  loadMore: () => void;
};

const DEBOUNCE_MS = 250;

export function usePrincipalSearch(
  query: string,
  enabled: boolean,
  kinds: readonly PrincipalType[],
  idProvider?: string,
): PrincipalSearch {
  const [state, setState] = useState<PrincipalSearchState>(IDLE_PRINCIPAL_SEARCH);
  const pending = useRef<AbortController | undefined>(undefined);

  const kindsRef = useRef(kinds);
  kindsRef.current = kinds;
  const kindsKey = kinds.join(',');

  const provider = idProvider === undefined || idProvider.length === 0 ? undefined : idProvider;

  const settle = (controller: AbortController): void => {
    if (pending.current === controller) {
      pending.current = undefined;
    }
  };

  useEffect(() => {
    pending.current?.abort();
    pending.current = undefined;

    if (!enabled) {
      setState(IDLE_PRINCIPAL_SEARCH);
      return;
    }

    setState(beginPrincipalSearch);

    const controller = new AbortController();
    pending.current = controller;

    const timer = setTimeout(() => {
      void searchPrincipals(
        {
          types: kindsRef.current,
          idProvider: provider,
          search: query,
          start: 0,
          count: PRINCIPAL_SEARCH_PAGE,
        },
        controller.signal,
      ).match(
        (page) => {
          if (!controller.signal.aborted) {
            settle(controller);
            setState(receivePrincipalSearch(page));
          }
        },
        (failure) => {
          if (!controller.signal.aborted) {
            settle(controller);
            setState(failPrincipalSearch(failure.message));
          }
        },
      );
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
      pending.current?.abort();
      pending.current = undefined;
    };
  }, [query, enabled, kindsKey, provider]);

  const start = principalSearchAppendStart(state);

  const loadMore = (): void => {
    if (start === undefined || pending.current !== undefined) {
      return;
    }

    const controller = new AbortController();
    pending.current = controller;

    setState(beginPrincipalSearchAppend);

    void searchPrincipals(
      {
        types: kindsRef.current,
        idProvider: provider,
        search: query,
        start,
        count: PRINCIPAL_SEARCH_PAGE,
      },
      controller.signal,
    ).match(
      (page) => {
        if (!controller.signal.aborted) {
          settle(controller);
          setState((current) => appendPrincipalSearch(current, page));
        }
      },
      (failure) => {
        if (!controller.signal.aborted) {
          settle(controller);
          setState((current) => failPrincipalSearchAppend(current, failure.message));
        }
      },
    );
  };

  return { ...state, hasMore: start !== undefined, loadMore };
}
