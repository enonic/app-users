import type { PropertyTreeJson } from '@enonic/ui-types';

import { openConfigTree, savedConfigOf } from './idprovider-config-tree';
import type { IdProviderConfigState } from './idprovider-config.store';

/**
 * The binding a save writes: the application, what the configuration dialog applied, and the application
 * the provider is bound to already — empty on a create.
 */
export type IdProviderBinding = {
  application: string;
  applied: PropertyTreeJson | undefined;
  bound: string;
};

/**
 * Whether a save writes a configuration for the binding at all: a create or a rebind starts one from the
 * form, and an applied tree replaces the stored one. An edit that does neither keeps what is stored.
 */
export function writesIdProviderConfig({
  application,
  applied,
  bound,
}: IdProviderBinding): boolean {
  return application.length > 0 && (application !== bound || applied !== undefined);
}

/**
 * The configuration a save writes: what the dialog applied, or else what is stored, with the form's
 * defaults where neither has a value. Undefined keeps the stored tree: a save that writes none, or an
 * application with no form to read it through.
 */
export function effectiveIdProviderConfig(
  state: IdProviderConfigState,
  binding: IdProviderBinding,
): PropertyTreeJson | undefined {
  const { application, applied } = binding;
  if (!writesIdProviderConfig(binding)) {
    return undefined;
  }

  if (state.status !== 'ready' || state.application !== application) {
    return undefined;
  }

  return savedConfigOf(openConfigTree(state.form, applied ?? state.stored));
}
