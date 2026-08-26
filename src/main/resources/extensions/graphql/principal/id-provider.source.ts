import {
  createIdProvider as createProvider,
  defaultIdProviderPermissions,
  deleteIdProviders as deleteProviders,
  getIdProvider as getProvider,
  getIdProviderPermissions,
  updateIdProvider as updateProvider,
  type IdProviderAccess,
  type IdProviderConfig as TypedIdProviderConfig,
  type IdProvider as TypedIdProvider,
  type IdProviderPermission,
} from '/lib/idprovider';
import { getDescriptor } from '/lib/xp/app';
import { findPrincipals, getIdProviders, type IdProvider } from '/lib/xp/auth';

import {
  byName,
  displayNameOf,
  nonEmpty,
  toPrincipalItem,
  type PrincipalItem,
} from './principal.source';

export type IdProviderSource = IdProvider;

export type BoundApplication = {
  key: string;
  displayName: string;
};

/** Carries what a count or a listing needs, so the container itself costs nothing to resolve. */
export type PrincipalSetSource = {
  idProvider: string;
  type: 'user' | 'group';
};

export function listIdProviders(): IdProvider[] {
  return getIdProviders().sort((a, b) => byName(displayNameOf(a), displayNameOf(b)));
}

export function getIdProvider(key: string): IdProvider | null {
  // `lib/xp/auth` has no read-one, and the list is a handful of entries even on a large install.
  return getIdProviders().find((provider) => provider.key === key) ?? null;
}

/**
 * The application a provider is bound to, named as an administrator would recognise it.
 *
 * Null when the provider is bound to nothing, which means it serves no login. The display name comes
 * from the application's own descriptor and falls back to the key — an application that ships no
 * title is still better shown by its key than by nothing.
 */
export function boundApplicationOf(provider: IdProvider): BoundApplication | null {
  const key = provider.idProviderConfig?.applicationKey;
  if (key == null) {
    return null;
  }

  return { key, displayName: nonEmpty(getDescriptor({ key })?.title ?? undefined) ?? key };
}

export function principalSetOf(
  idProvider: string,
  type: PrincipalSetSource['type'],
): PrincipalSetSource {
  return { idProvider, type };
}

/**
 * How many principals of this kind the provider holds.
 *
 * `count: 0` asks the search for the total and no hits at all — the cheap half of the pair. A
 * provider can hold a whole corporate directory, so the count must never be the length of a list
 * somebody fetched.
 */
export function countPrincipals({ idProvider, type }: PrincipalSetSource): number {
  return findPrincipals({ type, idProvider, count: 0 }).total;
}

/**
 * ! Not sorted, which is what makes paging sound: `findPrincipals` takes no order, so sorting a page
 * ! would order that page alone and the next would restart below it. `-1` is the whole directory.
 */
export function listPrincipals(
  { idProvider, type }: PrincipalSetSource,
  start: number,
  count: number,
): PrincipalItem[] {
  return findPrincipals({ type, idProvider, start, count }).hits.map(toPrincipalItem);
}

export type IdProviderPermissionSource = IdProviderPermission;

/**
 * Who may reach this provider, and how far.
 *
 * Empty for a provider the platform holds no access control list for, which a freshly created one is
 * until somebody grants something.
 */
export function listIdProviderPermissions(idProvider: string): IdProviderPermission[] {
  return getIdProviderPermissions({ idProvider }) ?? [];
}

export function listDefaultIdProviderPermissions(): IdProviderPermission[] {
  return defaultIdProviderPermissions();
}

/** One entry of a permissions write, as the mutation's input object carries it. */
export type IdProviderPermissionInput = {
  principal: string;
  access: IdProviderAccess;
};

/** What a provider is to hold. Stated rather than diffed: it has one of each, so there is no list. */
export type IdProviderInput = {
  displayName: string;
  description?: string;
  /** The application serving the login. Absent leaves the provider bound to nothing. */
  application?: string;
  permissions: readonly IdProviderPermissionInput[];
};

export type IdProviderDeletion = {
  key: string;
  deleted: boolean;
  reason?: string;
};

export function createIdProvider(name: string, input: IdProviderInput): IdProvider {
  const provider = createProvider({
    key: name,
    displayName: input.displayName,
    description: input.description,
    idProviderConfig: input.application == null ? undefined : bindingTo(input.application),
    permissions: [...input.permissions],
  });

  if (provider == null) {
    throw new Error(`The id provider [${name}] was not created`);
  }

  return toSource(provider);
}

/** Null when no provider answers to the key, which is an answer rather than a failure. */
export function updateIdProvider(key: string, changes: IdProviderInput): IdProvider | null {
  const provider = updateProvider({
    idProvider: key,
    displayName: changes.displayName,
    description: changes.description,
    idProviderConfig: bindingFor(key, changes.application),
    permissions: [...changes.permissions],
  });

  return provider == null ? null : toSource(provider);
}

export function deleteIdProviders(keys: readonly string[]): IdProviderDeletion[] {
  return deleteProviders({ idProviders: [...keys] });
}

/**
 * ! The same application keeps the configuration already stored: nothing renders it until #64, so the
 * ! empty tree the dialog knows about would throw away whatever configured the login.
 */
function bindingFor(key: string, application?: string): TypedIdProviderConfig | null {
  if (application == null || application.length === 0) {
    return null;
  }

  const current = getProvider({ idProvider: key })?.idProviderConfig;

  return current != null && current.applicationKey === application
    ? current
    : bindingTo(application);
}

function bindingTo(application: string): TypedIdProviderConfig {
  return { applicationKey: application, config: [] };
}

/** The provider as the schema reads it. `config` is dropped: no field exposes it. */
function toSource(provider: TypedIdProvider): IdProvider {
  return {
    key: provider.key,
    displayName: provider.displayName,
    description: provider.description,
    idProviderConfig:
      provider.idProviderConfig == null
        ? undefined
        : { applicationKey: provider.idProviderConfig.applicationKey },
  };
}
