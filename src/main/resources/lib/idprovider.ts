/**
 * The id provider surface no XP JS lib exposes.
 *
 * `lib/xp/auth` reads the provider list and creates one; reading a single provider, updating one,
 * deleting one, its permissions and its descriptor all need `SecurityService` or
 * `IdProviderDescriptorService` directly, which is what the beans behind this module are for.
 *
 * ! `createIdProvider` here is not the one in `lib/xp/auth`, and the difference is the config: that one
 * ! builds the `PropertyTree` with `fromMap`, which infers a type per value and so cannot store a
 * ! `Reference` or a `GeoPoint` as itself. A provider's config is filled from the form its application
 * ! declares, so the types have to survive — see `IdProviderConfigMapper`.
 */

import type { ScriptValue } from '/lib/xp/core';

export type IdProviderDescriptor = {
  /** Absent when the descriptor declares no `mode:`. The builder has no default. */
  mode?: string;
  /** Whether the descriptor declares a config form. The form itself is not carried — see #64. */
  hasConfig: boolean;
};

export type GetIdProviderDescriptorParams = {
  application: string;
};

type GetIdProviderDescriptorHandler = {
  setApplication(value: string): void;
  execute(): IdProviderDescriptor | null;
};

/** Null when the application ships no descriptor, i.e. when it is not an id provider at all. */
export function getIdProviderDescriptor(
  params: GetIdProviderDescriptorParams,
): IdProviderDescriptor | null {
  const bean = __.newBean<GetIdProviderDescriptorHandler>(
    'com.enonic.xp.app.users.lib.idprovider.GetIdProviderDescriptorHandler',
  );
  bean.setApplication(params.application);
  return __.toNativeObject(bean.execute());
}

/** A principal that may reach a provider, and how far. XP's `IdProviderAccess`. */
export type IdProviderAccess =
  | 'READ'
  | 'CREATE_USERS'
  | 'WRITE_USERS'
  | 'ID_PROVIDER_MANAGER'
  | 'ADMINISTRATOR';

export type IdProviderPermission = {
  principal: {
    key: string;
    type: string;
    displayName: string;
  };
  access?: IdProviderAccess;
};

type GetIdProviderPermissionsHandler = {
  setIdProviderKey(value: string): void;
  execute(): IdProviderPermission[] | null;
};

/** Null when no provider answers to the key. `lib/xp/auth` exposes none of this. */
export function getIdProviderPermissions(params: {
  idProvider: string;
}): IdProviderPermission[] | null {
  const bean = __.newBean<GetIdProviderPermissionsHandler>(
    'com.enonic.xp.app.users.lib.idprovider.GetIdProviderPermissionsHandler',
  );
  bean.setIdProviderKey(params.idProvider);
  return __.toNativeObject(bean.execute());
}

type DefaultIdProviderPermissionsHandler = {
  execute(): IdProviderPermission[];
};

/**
 * What a new provider starts from. XP declares no default, so this is app-users' own list: administrators
 * and the user manager as ADMINISTRATOR, everyone authenticated as READ.
 */
export function defaultIdProviderPermissions(): IdProviderPermission[] {
  const bean = __.newBean<DefaultIdProviderPermissionsHandler>(
    'com.enonic.xp.app.users.lib.idprovider.DefaultIdProviderPermissionsHandler',
  );
  return __.toNativeObject(bean.execute());
}

/** One entry of a permissions write: the principal's key, and how far it may reach. */
export type IdProviderPermissionInput = {
  principal: string;
  access: IdProviderAccess;
};

/**
 * One value of a config property: a scalar under `v`, or the properties of a nested set under `set`.
 *
 * Both may be absent, and which one is says something: a null of a nullable type — a `Reference`, a
 * `BinaryReference` — is left out of `values` entirely, while a null of any other type arrives as `{}`.
 */
export type IdProviderConfigValue = {
  v?: unknown;
  set?: IdProviderConfigProperty[];
};

/** A config property with the `ValueType` it is stored as — `String`, `Long`, `Reference`, `PropertySet`. */
export type IdProviderConfigProperty = {
  name: string;
  type: string;
  values: IdProviderConfigValue[];
};

/**
 * What binds a provider to the application serving its login, with that application's own configuration.
 *
 * Not `lib/xp/auth`'s `IdProviderConfig`: the config is a list of typed properties rather than a plain
 * object, because a plain object cannot say that `defaultGroups` is a `Reference`.
 */
export type IdProviderConfig = {
  applicationKey: string;
  config: IdProviderConfigProperty[];
};

/** A provider as its own beans answer with it. Absent `idProviderConfig` means it serves no login. */
export type IdProvider = {
  key: string;
  displayName: string;
  description?: string;
  idProviderConfig?: IdProviderConfig;
};

type GetIdProviderHandler = {
  setIdProviderKey(value: string): void;
  execute(): IdProvider | null;
};

/**
 * One provider by key, with its typed config. Null when no provider answers to the key.
 *
 * `lib/xp/auth` has no read-one at all, and its list carries the config as a plain object.
 */
export function getIdProvider(params: { idProvider: string }): IdProvider | null {
  const bean = __.newBean<GetIdProviderHandler>(
    'com.enonic.xp.app.users.lib.idprovider.GetIdProviderHandler',
  );
  bean.setIdProviderKey(params.idProvider);
  return __.toNativeObject(bean.execute());
}

export type CreateIdProviderParams = {
  /** The provider's key, which is fixed for its lifetime. */
  key: string;
  displayName: string;
  description?: string;
  idProviderConfig?: IdProviderConfig;
  /** Omitted leaves a provider only the root permissions reach — see `defaultIdProviderPermissions`. */
  permissions?: IdProviderPermissionInput[];
};

type CreateIdProviderHandler = {
  setKey(value: string): void;
  setDisplayName(value: string): void;
  setDescription(value: string | null): void;
  setIdProviderConfig(value: ScriptValue | null): void;
  setPermissions(value: ScriptValue | null): void;
  execute(): IdProvider | null;
};

export function createIdProvider(params: CreateIdProviderParams): IdProvider | null {
  const bean = __.newBean<CreateIdProviderHandler>(
    'com.enonic.xp.app.users.lib.idprovider.CreateIdProviderHandler',
  );
  bean.setKey(params.key);
  bean.setDisplayName(params.displayName);
  bean.setDescription(__.nullOrValue(params.description ?? null));
  bean.setIdProviderConfig(__.toScriptValue(params.idProviderConfig ?? null));
  bean.setPermissions(__.toScriptValue(params.permissions ?? null));
  return __.toNativeObject(bean.execute());
}

export type UpdateIdProviderParams = {
  idProvider: string;
  displayName: string;
  /** Absent clears the description: the caller states what the provider is to hold. */
  description?: string;
  /**
   * The application binding, stated rather than patched — `null` unbinds the provider. Required for
   * exactly that reason: leaving it out of an update would take a provider's login with it.
   */
  idProviderConfig: IdProviderConfig | null;
  /** Omitted leaves the permissions alone; a list replaces them wholesale, as XP's own write does. */
  permissions?: IdProviderPermissionInput[];
};

type UpdateIdProviderHandler = {
  setIdProviderKey(value: string): void;
  setDisplayName(value: string): void;
  setDescription(value: string | null): void;
  setIdProviderConfig(value: ScriptValue | null): void;
  setPermissions(value: ScriptValue | null): void;
  execute(): IdProvider | null;
};

/** Null when no provider answers to the key, which is an answer rather than a failure. */
export function updateIdProvider(params: UpdateIdProviderParams): IdProvider | null {
  const bean = __.newBean<UpdateIdProviderHandler>(
    'com.enonic.xp.app.users.lib.idprovider.UpdateIdProviderHandler',
  );
  bean.setIdProviderKey(params.idProvider);
  bean.setDisplayName(params.displayName);
  bean.setDescription(__.nullOrValue(params.description ?? null));
  bean.setIdProviderConfig(__.toScriptValue(params.idProviderConfig));
  bean.setPermissions(__.toScriptValue(params.permissions ?? null));
  return __.toNativeObject(bean.execute());
}

/** What became of one key in a delete: gone, or refused with the platform's reason. */
export type DeleteIdProviderResult = {
  key: string;
  deleted: boolean;
  /** Absent when the provider is gone. */
  reason?: string;
};

type DeleteIdProvidersHandler = {
  setIdProviderKeys(value: ScriptValue): void;
  execute(): DeleteIdProviderResult[];
};

/**
 * Deletes several providers, one result per key in the order asked.
 *
 * A key the platform refuses does not fail the call: the caller gets `deleted: false` with the reason, so
 * one refusal cannot hide what happened to the rest.
 */
export function deleteIdProviders(params: { idProviders: string[] }): DeleteIdProviderResult[] {
  const bean = __.newBean<DeleteIdProvidersHandler>(
    'com.enonic.xp.app.users.lib.idprovider.DeleteIdProvidersHandler',
  );
  bean.setIdProviderKeys(__.toScriptValue(params.idProviders));
  return __.toNativeObject(bean.execute());
}
