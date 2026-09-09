import { atom } from 'nanostores';

import {
  fetchIdProviderApplications,
  type IdProviderApplication,
} from '../../../entities/application';

/** The applications a provider can be bound to, read as the dialog opens. */
export const $idProviderApplications = atom<readonly IdProviderApplication[]>([]);

// A failed read leaves the selector with nothing to offer, and says so nowhere: the binding is optional,
// and the rest of the form is not held up by it.
export function loadIdProviderApplications(signal?: AbortSignal): void {
  void fetchIdProviderApplications(signal).match(
    (loaded) => {
      if (signal?.aborted !== true) {
        $idProviderApplications.set(loaded);
      }
    },
    () => {
      if (signal?.aborted !== true) {
        $idProviderApplications.set([]);
      }
    },
  );
}
