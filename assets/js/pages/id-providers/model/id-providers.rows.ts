import type { ReactNode } from 'react';

import type { IdProvider } from '../../../entities/principal';
import type { BrowseRow } from '../../../widgets/browse-list/browse-list';

export function toIdProviderRow(provider: IdProvider, icon?: ReactNode): BrowseRow {
  const application = provider.application?.displayName;

  return {
    key: provider.key,
    title: provider.displayName,
    // A provider's key is its name; there is no provider above it to qualify it.
    subtitle: provider.key,
    icon,
    // The application the provider is bound to. Bound to none means no cell at all — `meta` is a
    // list of cells, and an absent value is not one.
    meta: application === undefined ? undefined : [application],
  };
}
