import {
  useIdProvider,
  useIdProviderPermissions,
  useIdProviderPrincipals,
} from '../../entities/principal';
import { useItemId } from '../../shared/host';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import { IdProviderDetails } from './IdProviderDetails';

type IdProvidersItemPageProps = {
  'data-component'?: string;
};

const ID_PROVIDERS_ITEM_PAGE_NAME = 'IdProvidersItemPage';

export function IdProvidersItemPage({
  'data-component': componentName = ID_PROVIDERS_ITEM_PAGE_NAME,
}: IdProvidersItemPageProps) {
  const id = useItemId();
  const provider = useIdProvider(id);
  const principals = useIdProviderPrincipals(id);
  const permissions = useIdProviderPermissions(id);

  if (!provider) {
    return <DetailsPanel.Empty data-component={componentName} labelKey="browse.details.empty" />;
  }

  // The rows belong to the provider they were read for, and only once that read has answered: a panel
  // still reading — a selection that has just moved, a `Refresh` — shows the counts the row carries,
  // rather than dropping its Users and Groups sections to nothing and back.
  const read = principals.key === provider.key ? principals : undefined;
  const readFailed = read?.status === 'error';
  const rows = read?.status === 'ready' ? read : undefined;

  return (
    <IdProviderDetails
      provider={provider}
      principals={rows}
      principalsLoading={rows === undefined && readFailed !== true}
      principalsFailed={readFailed}
      permissions={permissions.item?.permissions}
      permissionsLoading={permissions.status === 'loading' && permissions.item === undefined}
      permissionsFailed={permissions.status === 'error'}
    />
  );
}

IdProvidersItemPage.displayName = ID_PROVIDERS_ITEM_PAGE_NAME;
