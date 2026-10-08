import { Combobox, Listbox } from '@enonic/ui';
import { ShieldLock } from 'lucide-react';
import { useMemo, useState } from 'preact/hooks';

import { useI18n } from '../../../shared/i18n';
import { ItemLabel } from '../../../shared/ui/ItemLabel';
import { searchIdProviderNames } from '../model/id-provider-search';
import type { IdProviderName } from '../model/principal.types';

export type IdProviderSelectorProps = {
  providers: readonly IdProviderName[];
  /** The picked provider's key, empty while none is. */
  value: string;
  onChange: (key: string) => void;
  /** The id of the field label that names the selector. */
  labelledBy: string;
  placeholder: string;
  error?: boolean;
  /** The providers are still being read, so an empty list says nothing yet. */
  loading?: boolean;
};

const ID_PROVIDER_SELECTOR_NAME = 'IdProviderSelector';

/**
 * Picks one provider from the ones already loaded, narrowing the list as the user types. Laid out as
 * `PrincipalPicker` is — the search above, the pick in a row below it — so the dialogs read alike.
 */
export function IdProviderSelector({
  providers,
  value,
  onChange,
  labelledBy,
  placeholder,
  error = false,
  loading = false,
}: IdProviderSelectorProps) {
  const searchingLabel = useI18n('principal.picker.searching');
  const noMatchesLabel = useI18n('principal.picker.noMatches');

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const selection = useMemo(() => (value.length > 0 ? [value] : []), [value]);

  const picked =
    value.length > 0
      ? (providers.find(({ key }) => key === value) ?? { key: value, displayName: value })
      : undefined;
  const offered = searchIdProviderNames(providers, query);

  const handleOpenChange = (next: boolean): void => {
    setOpen(next);
    if (!next) {
      setQuery('');
    }
  };

  // ! A required field: picking the provider already held would clear it in single mode.
  const handleSelectionChange = (next: readonly string[]): void => {
    const [key] = next;
    if (key !== undefined) {
      onChange(key);
    }
  };

  return (
    <div data-component={ID_PROVIDER_SELECTOR_NAME} className="flex flex-col gap-1.5">
      <Combobox
        open={open}
        onOpenChange={handleOpenChange}
        value={query}
        onChange={(next) => setQuery(next ?? '')}
        selectionMode="single"
        selection={selection}
        onSelectionChange={handleSelectionChange}
        contentType="listbox"
        error={error}
      >
        <Combobox.Content>
          <Combobox.Control>
            <Combobox.Search>
              <Combobox.SearchIcon />
              <Combobox.Input aria-labelledby={labelledBy} placeholder={placeholder} />
              <Combobox.Toggle />
            </Combobox.Search>
          </Combobox.Control>

          <Combobox.Portal>
            <Combobox.Popup>
              <Combobox.ListContent className="max-h-60 overflow-y-auto">
                {loading && offered.length === 0 && (
                  <p className="text-subtle px-2.5 py-1 text-sm">{searchingLabel}</p>
                )}

                {!loading && offered.length === 0 && query.trim().length > 0 && (
                  <p className="text-subtle px-2.5 py-1 text-sm">{noMatchesLabel}</p>
                )}

                {offered.map((provider) => (
                  <Listbox.Item key={provider.key} value={provider.key} className="px-2.5 py-1.5">
                    <IdProviderLabel className="flex-1" provider={provider} />
                  </Listbox.Item>
                ))}
              </Combobox.ListContent>
            </Combobox.Popup>
          </Combobox.Portal>
        </Combobox.Content>
      </Combobox>

      {picked !== undefined && (
        <div data-component="IdProviderSelector.Picked" className="px-2 py-2.5">
          <IdProviderLabel provider={picked} />
        </div>
      )}
    </div>
  );
}

IdProviderSelector.displayName = ID_PROVIDER_SELECTOR_NAME;

//
// * Internal
//

type IdProviderLabelProps = {
  provider: IdProviderName;
  className?: string;
};

function IdProviderLabel({ provider, className }: IdProviderLabelProps) {
  return (
    <ItemLabel
      className={className}
      icon={<ShieldLock size={28} strokeWidth={1.5} aria-hidden />}
      primary={provider.displayName}
      secondary={provider.key}
    />
  );
}
