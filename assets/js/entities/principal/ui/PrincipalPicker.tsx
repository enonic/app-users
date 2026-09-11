import { Checkbox, Combobox, GridList, IconButton, Listbox, useCombobox } from '@enonic/ui';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'preact/hooks';
import type { ReactNode, UIEvent } from 'react';

import { i18n, useI18n } from '../../../shared/i18n';
import { FieldLabel } from '../../../shared/ui/FieldLabel';
import type { PrincipalRef, PrincipalType } from '../model/principal.types';
import { usePrincipalSearch, type PrincipalSearch } from '../model/usePrincipalSearch';
import { PrincipalLabel } from './PrincipalLabel';

export type PrincipalPickerProps = {
  selected: readonly PrincipalRef[];
  onChange: (next: readonly PrincipalRef[]) => void;
  /** Which kinds of principal this picker offers: members are users and groups, memberships roles. */
  kinds: readonly PrincipalType[];
  /** Omitted where a section header already names the picker. */
  label?: string;
  placeholder: string;
  /**
   * A control the caller owns on every picked row, rendered before the remove button — the access level
   * of an id provider permission is the case.
   */
  rowTrailing?: (principal: PrincipalRef) => ReactNode;
  /**
   * Principals the caller pins: the row's remove button is disabled and the option is inert in the
   * popup. An id provider's seeded permissions are the case.
   */
  locked?: ReadonlySet<string>;
  /** Principals kept out of the offer altogether, unlike `locked`, which shows them inert. */
  excluded?: ReadonlySet<string>;
  /** Offers only principals from this ID provider. */
  idProvider?: string;
};

const LOAD_MORE_MARGIN = 48;

export function PrincipalPicker({
  selected,
  onChange,
  kinds,
  label,
  placeholder,
  rowTrailing,
  locked,
  excluded,
  idProvider,
}: PrincipalPickerProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const labelId = useId();

  const searchingLabel = useI18n('principal.picker.searching');
  const noMatchesLabel = useI18n('principal.picker.noMatches');
  const failedLabel = useI18n('principal.picker.failed');
  const removeLabel = (principal: PrincipalRef): string =>
    i18n('principal.picker.remove', principal.displayName);
  const applyLabel = useI18n('principal.picker.apply');

  const search = usePrincipalSearch(query, open, kinds, idProvider);

  // ? The exclusion sits on the offer alone: a principal already picked stays in the list below even when
  // ? a later change would no longer offer it, rather than disappearing from under the user.
  const offered = search.principals.filter(({ key }) => excluded?.has(key) !== true);

  const pickedKeys = selected.map(({ key }) => key);

  const known = new Map<string, PrincipalRef>(
    [...selected, ...offered].map((principal) => [principal.key, principal]),
  );

  // ! Staged, not single or multiple: single closes the popup on the first click, multiple commits every
  // ! click straight into the form. Staged ticks are the user's, and only Apply hands them over.
  const replace = (next: readonly string[]): void => {
    const nextKeys = new Set<string>(next);
    const kept = selected.filter(({ key }) => nextKeys.has(key) || locked?.has(key) === true);
    const added = [...nextKeys]
      .filter((key) => !pickedKeys.some((picked) => picked === key))
      .map((key) => known.get(key))
      .filter((principal): principal is PrincipalRef => principal !== undefined);

    onChange([...kept, ...added]);
  };

  const remove = (key: string): void => {
    onChange(selected.filter((member) => member.key !== key));
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label !== undefined && <FieldLabel id={labelId} text={label} />}

      <Combobox
        open={open}
        onOpenChange={setOpen}
        value={query}
        onChange={(next) => setQuery(next ?? '')}
        selectionMode="staged"
        selection={pickedKeys}
        onSelectionChange={replace}
        contentType="listbox"
      >
        <Combobox.Content>
          <Combobox.Control>
            <Combobox.Search>
              <Combobox.SearchIcon />
              <Combobox.Input
                aria-label={label === undefined ? placeholder : undefined}
                aria-labelledby={label === undefined ? undefined : labelId}
                placeholder={placeholder}
              />
              <Combobox.Apply label={applyLabel} />
              <Combobox.Toggle />
            </Combobox.Search>
          </Combobox.Control>

          <Combobox.Portal>
            <Combobox.Popup>
              <PrincipalOptions
                principals={offered}
                search={search}
                locked={locked}
                searchingLabel={searchingLabel}
                noMatchesLabel={noMatchesLabel}
                failedLabel={failedLabel}
              />
            </Combobox.Popup>
          </Combobox.Portal>
        </Combobox.Content>
      </Combobox>

      {selected.length > 0 && (
        <GridList className="flex flex-col gap-2.5 rounded-md py-1.5 pr-1 pl-1">
          {selected.map((member) => (
            <GridList.Row key={member.key} id={`${member.key}-picked`} className="gap-2.5 p-1">
              <GridList.Cell interactive={false} className="flex-1 self-stretch">
                <PrincipalLabel className="min-w-0 flex-1" principal={member} />
              </GridList.Cell>

              {rowTrailing !== undefined && <GridList.Cell>{rowTrailing(member)}</GridList.Cell>}

              <GridList.Cell>
                <GridList.Action>
                  {/* Disabled rather than absent on a pinned row: the column keeps its width, so the
                      rows below it do not shift. */}
                  <IconButton
                    aria-label={removeLabel(member)}
                    icon={X}
                    variant="text"
                    disabled={locked?.has(member.key)}
                    onClick={() => remove(member.key)}
                  />
                </GridList.Action>
              </GridList.Cell>
            </GridList.Row>
          ))}
        </GridList>
      )}
    </div>
  );
}

type PrincipalOptionsProps = {
  principals: readonly PrincipalRef[];
  search: PrincipalSearch;
  locked?: ReadonlySet<string>;
  searchingLabel: string;
  noMatchesLabel: string;
  failedLabel: string;
};

function PrincipalOptions({
  principals,
  search,
  locked,
  searchingLabel,
  noMatchesLabel,
  failedLabel,
}: PrincipalOptionsProps) {
  // ! The staged ticks, not the applied ones: the selection this reads is the combobox's own, so a box
  // ! ticks the moment it is clicked while the form still holds what Apply last handed it.
  const { selection } = useCombobox();

  const { status, error, appending, hasMore, loadMore } = search;

  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = end.current?.parentElement;

    if (hasMore && list != null && list.scrollHeight <= list.clientHeight) {
      loadMore();
    }
  }, [hasMore, loadMore, principals.length]);

  const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;

    if (hasMore && scrollHeight - scrollTop - clientHeight <= LOAD_MORE_MARGIN) {
      loadMore();
    }
  };

  return (
    <Combobox.ListContent className="max-h-60 overflow-y-auto" onScroll={handleScroll}>
      {status === 'loading' && principals.length === 0 && (
        <p className="text-subtle px-2.5 py-1 text-sm">{searchingLabel}</p>
      )}

      {status === 'ready' && principals.length === 0 && (
        <p className="text-subtle px-2.5 py-1 text-sm">{noMatchesLabel}</p>
      )}

      {principals.map((principal) => (
        <Listbox.Item
          key={principal.key}
          value={principal.key}
          disabled={locked?.has(principal.key)}
          className="px-2.5 py-1.5"
        >
          <PrincipalLabel className="flex-1" principal={principal} />
          <Checkbox
            tabIndex={-1}
            checked={selection.has(principal.key)}
            onClick={(event) => event.preventDefault()}
          />
        </Listbox.Item>
      ))}

      {appending && <p className="text-subtle px-2.5 py-1 text-sm">{searchingLabel}</p>}

      {error !== undefined && <p className="text-error px-2.5 py-1 text-sm">{failedLabel}</p>}

      <div ref={end} aria-hidden />
    </Combobox.ListContent>
  );
}
