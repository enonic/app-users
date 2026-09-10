import type { IdProviderAccess } from '../../../entities/principal';

/** The levels a principal can be granted, in the platform's own order, widening. */
export const ID_PROVIDER_ACCESS_LEVELS: readonly { value: IdProviderAccess; labelKey: string }[] = [
  { value: 'READ', labelKey: 'idProviders.dialog.access.read' },
  { value: 'CREATE_USERS', labelKey: 'idProviders.dialog.access.createUsers' },
  { value: 'WRITE_USERS', labelKey: 'idProviders.dialog.access.writeUsers' },
  { value: 'ID_PROVIDER_MANAGER', labelKey: 'idProviders.dialog.access.manager' },
  { value: 'ADMINISTRATOR', labelKey: 'idProviders.dialog.access.administrator' },
];
