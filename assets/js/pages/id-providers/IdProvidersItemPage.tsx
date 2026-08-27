import { useIdProvider, useIdProviderPrincipals } from '../../entities/principal';
import { useItemId } from '../../shared/host';
import { DetailsEmpty } from '../../widgets/details-panel/DetailsEmpty';
import { IdProviderDetails } from './IdProviderDetails';

export function IdProvidersItemPage() {
  const id = useItemId();
  const provider = useIdProvider(id);
  const principals = useIdProviderPrincipals(id);

  if (!provider) {
    return <DetailsEmpty labelKey="browse.details.empty" />;
  }

  // The rows belong to the provider they were read for, and only once that read has answered: a panel
  // still reading — a selection that has just moved, a `Refresh` — shows the counts the row carries,
  // rather than dropping its two sections to nothing and back.
  const read = principals.key === provider.key ? principals : undefined;

  return (
    <IdProviderDetails
      provider={provider}
      principals={read?.status === 'ready' ? read : undefined}
      principalsFailed={read?.status === 'error'}
    />
  );
}
