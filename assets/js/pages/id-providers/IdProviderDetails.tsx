import { Button } from '@enonic/ui';
import { ShieldLock } from 'lucide-react';

import {
  idProviderPrincipalsHasMore,
  loadMoreIdProviderPrincipals,
  principalName,
  type IdProvider,
  type IdProviderPrincipalsState,
  type PrincipalSetType,
} from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { openIdProviderEditor } from '../../features/idprovider-editor';
import { useI18n } from '../../shared/i18n';
import { countedSections } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';

export type IdProviderDetailsProps = {
  provider: IdProvider;
  /** The rows behind the totals, once the panel's own read has answered. */
  principals?: IdProviderPrincipalsState;
  /** That read failed: the totals the row carries still stand, the rows under them are missing. */
  principalsFailed?: boolean;
};

export function IdProviderDetails({
  provider,
  principals,
  principalsFailed,
}: IdProviderDetailsProps) {
  const editLabel = useI18n('idProviders.details.edit');
  const noApplicationLabel = useI18n('idProviders.details.noApplication');
  const loadMoreLabel = useI18n('browse.list.loadMore');
  const loadingMoreLabel = useI18n('browse.list.loadingMore');
  const loadMoreFailedLabel = useI18n('browse.list.loadMoreFailed');
  const listFailedLabel = useI18n('idProviders.details.listFailed');

  const { key, displayName, description, application } = provider;

  // The row's totals until the panel's own read answers, so a count appears before the rows do.
  const sections = countedSections([
    {
      labelKey: 'idProviders.details.users',
      type: 'user' as PrincipalSetType,
      set: principals?.users ?? provider.users,
      rows: principals?.users,
    },
    {
      labelKey: 'idProviders.details.groups',
      type: 'group' as PrincipalSetType,
      set: principals?.groups ?? provider.groups,
      rows: principals?.groups,
    },
  ]);

  return (
    <DetailsPanel>
      <DetailsPanel.Header
        icon={<ShieldLock size={48} strokeWidth={1.5} aria-hidden />}
        title={displayName}
        subtitle={key}
      />

      <DetailsPanel.Section
        labelKey="idProviders.details.info"
        action={
          <Button
            variant="outline"
            size="sm"
            label={editLabel}
            onClick={() => openIdProviderEditor(provider)}
          />
        }
      >
        {description !== undefined && (
          <DetailsPanel.Field labelKey="idProviders.details.description">
            {description}
          </DetailsPanel.Field>
        )}
        <DetailsPanel.Field labelKey="idProviders.details.application">
          {application?.displayName ?? noApplicationLabel}
        </DetailsPanel.Field>
      </DetailsPanel.Section>

      {sections.map(({ labelKey, type, set, rows }) => (
        <DetailsPanel.Section key={labelKey} labelKey={labelKey} count={set.total}>
          {/* Absent rows are "not read yet", not "none", so the heading and its count stand alone
              rather than over an empty list. */}
          {rows !== undefined && (
            <>
              <DetailsPanel.List>
                {rows.items.map((principal) => (
                  <DetailsPanel.ListItem
                    key={principal.key}
                    icon={<PrincipalIcon principal={principal} />}
                    title={principal.displayName}
                    subtitle={principalName(principal.key)}
                  />
                ))}
              </DetailsPanel.List>

              {rows.error !== undefined && (
                <p className="text-error text-sm">{loadMoreFailedLabel}</p>
              )}

              {idProviderPrincipalsHasMore(rows) && (
                <Button
                  variant="text"
                  size="sm"
                  className="self-start"
                  label={rows.appending ? loadingMoreLabel : loadMoreLabel}
                  disabled={rows.appending}
                  onClick={() => loadMoreIdProviderPrincipals(type)}
                />
              )}
            </>
          )}

          {principalsFailed && <p className="text-error text-sm">{listFailedLabel}</p>}
        </DetailsPanel.Section>
      ))}
    </DetailsPanel>
  );
}
