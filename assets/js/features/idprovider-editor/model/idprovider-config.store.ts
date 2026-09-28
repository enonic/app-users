import type { Form } from '@enonic/input-types/schema';
import type { PropertyTreeJson } from '@enonic/ui-types';
import { atom } from 'nanostores';

/**
 * What the bound application's configuration is checked and edited against: its form, and the tree the
 * provider holds for it. `absent` is an application that answers as no id provider — stopped, or removed
 * since the binding was made — which leaves nothing to check and the stored tree as it is.
 */
export type IdProviderConfigState =
  | { status: 'idle' }
  | { status: 'loading'; application: string }
  | { status: 'absent'; application: string }
  | { status: 'error'; application: string }
  | { status: 'ready'; application: string; form: Form; stored: PropertyTreeJson };

export const $idProviderConfig = atom<IdProviderConfigState>({ status: 'idle' });

/** Bumped to read the binding again after a failed load; the wizard's load keys on it. */
export const $idProviderConfigAttempt = atom(0);

export function beginIdProviderConfigLoad(application: string): void {
  $idProviderConfig.set({ status: 'loading', application });
}

export function receiveIdProviderConfig(
  application: string,
  form: Form,
  stored: PropertyTreeJson,
): void {
  $idProviderConfig.set({ status: 'ready', application, form, stored });
}

export function receiveNoIdProviderConfig(application: string): void {
  $idProviderConfig.set({ status: 'absent', application });
}

export function failIdProviderConfigLoad(application: string): void {
  $idProviderConfig.set({ status: 'error', application });
}

export function clearIdProviderConfig(): void {
  $idProviderConfig.set({ status: 'idle' });
}

/** Reads the binding again when its last load failed; a load that answered is left alone. */
export function retryIdProviderConfigLoad(application: string): void {
  const state = $idProviderConfig.get();
  if (state.status === 'error' && state.application === application) {
    $idProviderConfigAttempt.set($idProviderConfigAttempt.get() + 1);
  }
}
