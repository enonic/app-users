import { getIdProviderDescriptor } from '/lib/idprovider';

import { getIdProvider } from './id-provider.source';
import { SYSTEM_ID_PROVIDER } from './principal.keys';

/**
 * Who owns a provider's accounts, from its application's descriptor. `UNAVAILABLE` is ours, not the
 * platform's: the provider is bound to an application that ships no descriptor right now — not
 * installed, or not running — so nothing says who owns them, and it is treated as `EXTERNAL`.
 */
export const ID_PROVIDER_MODES = ['LOCAL', 'MIXED', 'EXTERNAL', 'UNAVAILABLE'] as const;

export type IdProviderMode = (typeof ID_PROVIDER_MODES)[number];

export type PrincipalWrite = 'user' | 'group';

const DESCRIBED_MODES: readonly IdProviderMode[] = ['LOCAL', 'MIXED', 'EXTERNAL'];

const WRITABLE: Record<PrincipalWrite, readonly IdProviderMode[]> = {
  user: ['LOCAL'],
  group: ['LOCAL', 'MIXED'],
};

/** What the resolution needs of a provider, which both `lib/xp/auth`'s and `lib/idprovider`'s carry. */
export type BoundProvider = { key: string; idProviderConfig?: { applicationKey: string } };

/**
 * ! The system store is `LOCAL` whatever its binding: XP binds it to the standard ID provider, and
 * ! stopping that application must not lock `su`, the service accounts and their public keys.
 *
 * ! A descriptor without `mode:` reads as `LOCAL`, and so does an unbound provider: `mode` is optional
 * ! in the descriptor schema and the builder has no default, so neither declares that a remote system
 * ! owns anything. A value XP does not know yet is not one this app can vouch for, so it reads as
 * ! `EXTERNAL`.
 */
export function idProviderModeOf(provider: BoundProvider): IdProviderMode {
  if (provider.key === SYSTEM_ID_PROVIDER) {
    return 'LOCAL';
  }

  const application = provider.idProviderConfig?.applicationKey;
  if (application == null) {
    return 'LOCAL';
  }

  const descriptor = getIdProviderDescriptor({ application });
  if (descriptor == null) {
    return 'UNAVAILABLE';
  }

  if (descriptor.mode == null) {
    return 'LOCAL';
  }

  return DESCRIBED_MODES.find((mode) => mode === descriptor.mode) ?? 'EXTERNAL';
}

export function allowsWrite(mode: IdProviderMode, write: PrincipalWrite): boolean {
  return WRITABLE[write].includes(mode);
}

/**
 * Refuses a write the provider's mode leaves to the remote system, and a provider nothing answers to.
 * Called before the first write, so a refusal leaves nothing half-applied.
 */
export function requireWritable(idProvider: string, write: PrincipalWrite): void {
  requireWritableIn([idProvider], write);
}

/** Whether a principal's own fields are XP's to write; its memberships always are, see `updateUser`. */
export function isWritablePrincipal(key: string, write: PrincipalWrite): boolean {
  const provider = getIdProvider(idProviderOfKey(key));

  return provider != null && allowsWrite(idProviderModeOf(provider), write);
}

/**
 * The same refusal for principals named by key — the key's middle segment is its provider — one read
 * per distinct provider however many keys there are.
 */
export function requireWritablePrincipals(keys: readonly string[], write: PrincipalWrite): void {
  requireWritableIn(keys.map(idProviderOfKey), write);
}

// ! A get per provider, not the list: `getIdProviders` searches an index a create leaves stale, so a
// ! provider made moments ago would fail its first write for not being there.
function requireWritableIn(idProviders: readonly string[], write: PrincipalWrite): void {
  for (const idProvider of new Set(idProviders)) {
    const provider = getIdProvider(idProvider);
    if (provider == null) {
      throw new Error(`No ID provider answers to [${idProvider}]`);
    }

    const mode = idProviderModeOf(provider);
    if (!allowsWrite(mode, write)) {
      throw new Error(
        `The ID provider [${idProvider}] in mode ${mode} does not allow ${write} writes`,
      );
    }
  }
}

function idProviderOfKey(key: string): string {
  const [, idProvider] = key.split(':');
  if (idProvider === undefined || idProvider.length === 0) {
    throw new Error(`No ID provider in [${key}]`);
  }

  return idProvider;
}
