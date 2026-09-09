import { createDetailLoader } from '../../../shared/detail';
import { fetchIdProviderPermissions } from '../api/id-providers.api';
import type { IdProviderPermissions } from './principal.types';

/**
 * The ID Providers details panel's access control list, loaded by key.
 *
 * No list query carries it — one bean call per provider — so the panel asks for the selected provider's
 * alone. Its own loader rather than the editor's `idprovider-edit-detail`: that one is forgotten when the
 * dialog closes, this one lives as long as the section and is evicted when a provider changes.
 */
const loader = createDetailLoader<IdProviderPermissions>({ load: fetchIdProviderPermissions });

export const $idProviderPermissions = loader.$detail;

export const showIdProviderPermissions = loader.show;

/** `Refresh`: the list was re-read, so the open provider's permissions are too. */
export const reloadIdProviderPermissions = loader.invalidate;

export const evictIdProviderPermissions = loader.evict;

/** Leaving the section: what is loaded describes a provider nobody is looking at any more. */
export const forgetIdProviderPermissions = loader.forget;
