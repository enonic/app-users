import type { PropertyTreeJson } from '@enonic/ui-types';

import { isConfigValid, openConfigTree } from './idprovider-config-tree';
import type { IdProviderConfigState } from './idprovider-config.store';

/**
 * What is wrong with the bound application's configuration, as a phrase key, or undefined when nothing
 * is: a required input left empty in what was applied — else in what is stored — or a form that could
 * not be read. A form still loading, or an application with none, has nothing to report.
 */
export function idProviderConfigIssue(
  state: IdProviderConfigState,
  application: string,
  applied: PropertyTreeJson | undefined,
): string | undefined {
  if (application.length === 0 || state.status === 'idle' || state.application !== application) {
    return undefined;
  }

  switch (state.status) {
    case 'loading':
    case 'absent':
      return undefined;
    case 'error':
      return 'idProviders.dialog.configFailed';
    case 'ready':
      return isConfigValid(state.form, openConfigTree(state.form, applied ?? state.stored))
        ? undefined
        : 'idProviders.dialog.configIncomplete';
  }
}
