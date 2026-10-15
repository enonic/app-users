import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import { fetchPrincipalsByKeys } from '../api/principal-search.api';
import { principalRefOf } from './principal.keys';
import type { PrincipalRef } from './principal.types';

export type PrincipalRefs = {
  /** One per key that reads as a principal key, in the keys' order. */
  refs: PrincipalRef[];
  /** Principals already in hand — a picker's choice — so naming them costs no request. */
  remember: (refs: readonly PrincipalRef[]) => void;
};

/**
 * The principals a list of stored keys names. A key is shown by its own name until the server answers,
 * and stays so when nothing answers to it any more — a config can outlive the group it points at.
 */
export function usePrincipalRefs(keys: readonly string[]): PrincipalRefs {
  const known = useRef(new Map<string, PrincipalRef>());
  const [, setVersion] = useState(0);

  const keysRef = useRef(keys);
  keysRef.current = keys;
  const keysKey = keys.join('\n');

  const remember = useCallback((refs: readonly PrincipalRef[]): void => {
    refs.forEach((ref) => known.current.set(ref.key, ref));
  }, []);

  useEffect(() => {
    const missing = keysRef.current.filter((key) => !known.current.has(key));
    if (missing.length === 0) {
      return;
    }

    const controller = new AbortController();

    void fetchPrincipalsByKeys(missing, controller.signal).match(
      (found) => {
        if (!controller.signal.aborted) {
          remember(found);
          setVersion((version) => version + 1);
        }
      },
      () => undefined,
    );

    return () => controller.abort();
  }, [keysKey, remember]);

  const refs = keys.flatMap((key) => {
    const ref = known.current.get(key) ?? principalRefOf(key);
    return ref === undefined ? [] : [ref];
  });

  return { refs, remember };
}
