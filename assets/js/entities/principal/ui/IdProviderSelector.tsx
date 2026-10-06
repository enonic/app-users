import { Combobox, Listbox } from '@enonic/ui';
import { useId, useMemo, useState } from 'preact/hooks';

import { useI18n } from '../../../shared/i18n';
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
};

const ID_PROVIDER_SELECTOR_NAME = 'IdProviderSelector';

/** Picks one provider from the ones already loaded, narrowing the list as the user types. */
export function IdProviderSelector({
  providers,
  value,
  onChange,
  labelledBy,
  placeholder,
  error = false,
}: IdProviderSelectorProps) {
  const valueId = useId();

  const noMatchesLabel = useI18n('principal.picker.noMatches');

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const selection = useMemo(() => (value.length > 0 ? [value] : []), [value]);

  const picked = providers.find(({ key }) => key === value);
  const pickedName = picked?.displayName ?? value;
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
    <div data-component={ID_PROVIDER_SELECTOR_NAME}>
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
              <Combobox.Value id={valueId} aria-labelledby={`${labelledBy} ${valueId}`}>
                {value.length > 0 ? (
                  <span className="truncate">{pickedName}</span>
                ) : (
                  <span className="text-subtle truncate">{placeholder}</span>
                )}
              </Combobox.Value>
              <Combobox.Input aria-labelledby={labelledBy} placeholder={placeholder} />
              <Combobox.Toggle />
            </Combobox.Search>
          </Combobox.Control>

          <Combobox.Portal>
            <Combobox.Popup>
              <Combobox.ListContent className="max-h-60 overflow-y-auto">
                {offered.length === 0 && query.trim().length > 0 && (
                  <p className="text-subtle px-2.5 py-1 text-sm">{noMatchesLabel}</p>
                )}

                {offered.map(({ key, displayName }) => (
                  <Listbox.Item key={key} value={key} className="px-2.5 py-1.5">
                    <span className="truncate">{displayName}</span>
                  </Listbox.Item>
                ))}
              </Combobox.ListContent>
            </Combobox.Popup>
          </Combobox.Portal>
        </Combobox.Content>
      </Combobox>
    </div>
  );
}

IdProviderSelector.displayName = ID_PROVIDER_SELECTOR_NAME;
