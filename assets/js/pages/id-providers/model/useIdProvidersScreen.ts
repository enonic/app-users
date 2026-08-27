import { useEffect } from 'preact/hooks';

import { forgetIdProviderPrincipalRows, loadIdProviders } from '../../../entities/principal';

/** Starts the load on mount. This section reads one domain, so the slice's own loader is the whole of it. */
export function useIdProvidersScreen(): void {
  useEffect(() => {
    void loadIdProviders();
  }, []);

  // The panel's rows go with the section, along with any read still on its way to a screen nobody is on.
  useEffect(() => forgetIdProviderPrincipalRows, []);
}
