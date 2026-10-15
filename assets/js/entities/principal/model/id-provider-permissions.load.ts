import { createDetailLoader } from '../../../shared/detail';
import { fetchIdProviderPermissions } from '../api/id-providers.api';
import type { IdProviderPermissions } from './principal.types';

/** The selected provider's access control list, shared by its details panel and editor. */
const loader = createDetailLoader<IdProviderPermissions>({ load: fetchIdProviderPermissions });

export const $idProviderPermissions = loader.$detail;

export const idProviderPermissionsFor = loader.detailFor;

export const showIdProviderPermissions = loader.show;

export const reloadIdProviderPermissions = loader.invalidate;

export const evictIdProviderPermissions = loader.evict;

export const forgetIdProviderPermissions = loader.forget;
