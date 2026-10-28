import { Combobox, Listbox } from '@enonic/ui';
import { useMemo, useState } from 'preact/hooks';

import { useI18n } from '../../../shared/i18n';
import { ItemLabel } from '../../../shared/ui/ItemLabel';
import { searchApplications } from '../model/application-search';
import type { IdProviderApplication } from '../model/application.types';
import { ApplicationIcon } from './ApplicationIcon';

export type ApplicationSelectorProps = {
  applications: readonly IdProviderApplication[];
  /** The bound application's key, empty while none is. */
  value: string;
  onChange: (key: string) => void;
  /** The id of the field label that names the selector. */
  labelledBy: string;
  placeholder: string;
  disabled?: boolean;
};

const APPLICATION_SELECTOR_NAME = 'ApplicationSelector';

/**
 * Picks one application from the ones already loaded, narrowing the list as the user types. The bound
 * one is not repeated here: the caller lists it in a row below, as `PrincipalPicker` does its picks.
 */
export function ApplicationSelector({
  applications,
  value,
  onChange,
  labelledBy,
  placeholder,
  disabled = false,
}: ApplicationSelectorProps) {
  const noMatchesLabel = useI18n('principal.picker.noMatches');

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const selection = useMemo(() => (value.length > 0 ? [value] : []), [value]);

  const offered = searchApplications(applications, query);

  const handleOpenChange = (next: boolean): void => {
    setOpen(next);
    if (!next) {
      setQuery('');
    }
  };

  // ! Picking the application already bound would clear it in single mode; the row's own button does that.
  const handleSelectionChange = (next: readonly string[]): void => {
    const [key] = next;
    if (key !== undefined) {
      onChange(key);
    }
  };

  return (
    <div data-component={APPLICATION_SELECTOR_NAME}>
      <Combobox
        open={open}
        onOpenChange={handleOpenChange}
        value={query}
        onChange={(next) => setQuery(next ?? '')}
        selectionMode="single"
        selection={selection}
        onSelectionChange={handleSelectionChange}
        contentType="listbox"
        disabled={disabled}
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
                {offered.length === 0 && query.trim().length > 0 && (
                  <p className="text-subtle px-2.5 py-1 text-sm">{noMatchesLabel}</p>
                )}

                {offered.map(({ key, displayName, icon }) => (
                  <Listbox.Item key={key} value={key} className="px-2.5 py-1.5">
                    <ItemLabel
                      className="flex-1"
                      icon={<ApplicationIcon icon={icon} />}
                      primary={displayName}
                      secondary={key}
                    />
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

ApplicationSelector.displayName = APPLICATION_SELECTOR_NAME;
