import {
  Button,
  cn,
  Combobox,
  IconButton,
  Listbox,
  Separator,
  useCombobox,
  usePhrases,
} from '@enonic/ui';
import { Check, ListFilter, X } from 'lucide-react';
import { Fragment } from 'preact';
import { useRef, useState } from 'preact/hooks';
import type { KeyboardEvent, RefObject } from 'react';

import {
  textTerm,
  toggledTerm,
  valuesOf,
  withoutTerm,
  withTerm,
  type FilterQuery,
  type FilterTerm,
} from '../../shared/filter';
import { Tag } from '../../shared/ui/Tag';
import {
  fieldTyped,
  groupedValues,
  isOffered,
  matchingFields,
  matchingValues,
  termLabel,
  type FilterField,
} from './browse-filter';
import { filterInputPhrases } from './filter-input.phrases';

export type FilterInputProps = {
  /** What the dropdown offers. None leaves the input a free-text search. */
  fields: readonly FilterField[];
  value: FilterQuery;
  onChange: (query: FilterQuery) => void;
  /** What the empty input invites, named for the section: `Search users`. */
  placeholder?: string;
  'data-component'?: string;
};

const FILTER_INPUT_NAME = 'FilterInput';

// One listbox holds both stages, so the ids say which kind of option was picked.
const FIELD_OPTION = 'field:';
const VALUE_OPTION = 'value:';

/**
 * The filter of a browse screen: values of predefined fields combined with free text, every term a
 * tag. Focusing the input opens the fields; picking one, or typing its label and a colon, opens its
 * values with their hit counts; picking a value, or pressing Enter on typed text, adds a tag.
 */
export function FilterInput({
  fields,
  value,
  onChange,
  placeholder: sectionPlaceholder,
  'data-component': componentName = FILTER_INPUT_NAME,
}: FilterInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pickedRef = useRef(false);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [fieldId, setFieldId] = useState<string>();

  // The component's own English, keyed the way the kit keys a fragment; the application's provider
  // translates it the same way it translates the library's.
  const t = usePhrases(filterInputPhrases);
  const filterLabel = t('enonic.uiKit.filterInput.label');
  const placeholder = sectionPlaceholder ?? t('enonic.uiKit.filterInput.placeholder');
  const valuePlaceholder = t('enonic.uiKit.filterInput.valuePlaceholder');
  const clearLabel = t('enonic.uiKit.filterInput.clear');

  const field = fields.find(({ id }) => id === fieldId);
  const offeredFields = field === undefined ? matchingFields(fields, text) : [];
  const offeredGroups =
    field === undefined ? [] : groupedValues(matchingValues(field.values, text));
  const offeredValues = offeredGroups.flatMap(({ values }) => values);
  const picked = field === undefined ? undefined : valuesOf(value, field.id);
  const stage = field === undefined ? 'fields' : 'values';
  const options = stage === 'fields' ? offeredFields.length : offeredValues.length;
  const active = value.length > 0 || text.length > 0 || field !== undefined;

  const focusInput = (): void => {
    inputRef.current?.focus();
  };

  const enterField = (next: FilterField | undefined): void => {
    setFieldId(next?.id);
    setText('');
  };

  const commit = (term: FilterTerm): void => {
    onChange(withTerm(value, term));
    enterField(undefined);
  };

  // A value already picked is picked again to take it back, the way the tag's own cross does.
  const toggle = (term: FilterTerm): void => {
    onChange(toggledTerm(value, term));
    enterField(undefined);
  };

  const handleTextChange = (typed: string | undefined): void => {
    const named = field === undefined ? fieldTyped(fields, typed ?? '') : undefined;
    if (named !== undefined) {
      enterField(named);
      return;
    }

    setText(typed ?? '');
  };

  const handlePick = ([id]: readonly string[]): void => {
    if (id === undefined) {
      return;
    }

    pickedRef.current = true;
    if (id.startsWith(FIELD_OPTION)) {
      enterField(fields.find((candidate) => candidate.id === id.slice(FIELD_OPTION.length)));
    } else if (field !== undefined) {
      toggle({ field: field.id, value: id.slice(VALUE_OPTION.length) });
    }
    // ! Synchronously, before the library's blur check runs: the option that was clicked is about to
    // ! unmount with the focus on it, and a focus that landed on the body would read as leaving.
    focusInput();
  };

  const handleOpenChange = (next: boolean): void => {
    // ! A single-select combobox closes on a pick. Ours stays open — a pick swaps the stage, and a
    // ! value picked is one of several — so the close a pick asks for is the one to ignore.
    if (!next && pickedRef.current) {
      pickedRef.current = false;
      return;
    }

    // Leaving the filter abandons a field no value was picked for: a bare `Field:` prefix left in the
    // input would read as a term that narrows nothing.
    if (!next && field !== undefined) {
      enterField(undefined);
    }

    setOpen(next);
  };

  const handleEnter = (): void => {
    if (field !== undefined) {
      // The first match not already picked; with none left there is nothing to add and the field stays.
      const first = offeredValues.find(
        (candidate) => isOffered(candidate) && picked?.has(candidate.id) !== true,
      );
      if (first !== undefined) {
        commit({ field: field.id, value: first.id });
      }
      return;
    }

    const term = textTerm(text);
    if (term !== undefined) {
      commit(term);
    }
  };

  const handleBackspace = (): void => {
    if (field !== undefined) {
      enterField(undefined);
    } else if (value.length > 0) {
      onChange(withoutTerm(value, value.length - 1));
    }
  };

  const handleEscape = (): boolean => {
    if (field === undefined) {
      return false;
    }

    enterField(undefined);
    return true;
  };

  const clear = (): void => {
    if (value.length > 0) {
      onChange([]);
    }
    enterField(undefined);
    focusInput();
  };

  return (
    <Combobox
      open={open && options > 0}
      onOpenChange={handleOpenChange}
      value={text}
      onChange={handleTextChange}
      selection={[]}
      onSelectionChange={handlePick}
      contentType="listbox"
    >
      {/*
        ! The box is the Content, not the Control: the library anchors its popup to the Control and gives it
        ! the Control's width, so the Control is the input alone — the popup then opens under the caret,
        ! after the tags, and takes the width of what it lists. The border, hover and focus ring the Control
        ! would have drawn move out here, to the box the user sees as the field.
      */}
      <Combobox.Content
        data-component={componentName}
        className={cn(
          'bg-surface-neutral border-bdr-subtle flex min-h-12 shrink-0 items-start gap-1.5 rounded-sm border p-1.5',
          'hover:outline-bdr-subtle hover:outline-2',
          'focus-within:ring-ring focus-within:ring-offset-ring-offset focus-within:ring-3 focus-within:ring-offset-3 focus-within:outline-none',
          'transition-highlight',
          open && 'border-bdr-strong',
        )}
      >
        <Button
          variant="text"
          size="sm"
          startIcon={ListFilter}
          label={filterLabel}
          onClick={focusInput}
          className="shrink-0"
        />

        {/* Only this middle wraps; the button and the cross stay on the first line, at the edges. A
            single line of tags is centred on the button's height, several lines fill the box. */}
        <div className="flex min-h-9 min-w-0 flex-1 flex-wrap content-center items-center gap-x-2 gap-y-1.5">
          {value.map((term, index) => {
            const { field: fieldName, value: valueName } = termLabel(term, fields);
            const name = fieldName === undefined ? valueName : `${fieldName}: ${valueName}`;

            return (
              <Tag
                key={'text' in term ? `text:${term.text}` : `${term.field}=${term.value}`}
                prefix={fieldName}
                label={valueName}
                removeLabel={t('enonic.uiKit.filterInput.remove', name)}
                onRemove={() => {
                  onChange(withoutTerm(value, index));
                  focusInput();
                }}
              />
            );
          })}

          {field !== undefined && (
            <span className="text-subtle shrink-0 whitespace-nowrap">{field.label}:</span>
          )}

          <Combobox.Control className="h-auto min-h-0 min-w-40 flex-1 rounded-none border-0 bg-transparent focus-within:ring-0 focus-within:ring-offset-0">
            <Combobox.Search className="h-auto bg-transparent px-1 py-0 hover:outline-none">
              <FilterTextInput
                inputRef={inputRef}
                text={text}
                placeholder={field === undefined ? placeholder : valuePlaceholder}
                onOpen={() => setOpen(true)}
                onEnter={handleEnter}
                onBackspace={handleBackspace}
                onEscape={handleEscape}
              />
            </Combobox.Search>
          </Combobox.Control>
        </div>

        {active && (
          <IconButton
            icon={X}
            variant="text"
            iconSize={28}
            iconStrokeWidth={1.25}
            title={clearLabel}
            aria-label={clearLabel}
            onClick={clear}
            className="text-subtle my-1 mr-1 size-7 shrink-0"
          />
        )}

        <Combobox.Portal>
          {/* ? `width: auto` undoes the Control's width the library sets inline; the list sizes to its labels. */}
          <Combobox.Popup style={{ width: 'auto' }} className="max-w-md min-w-72">
            {/* Keyed by stage, so the list activates its first option again when the options swap. */}
            <Combobox.ListContent key={stage} className="max-h-72 gap-y-0.5 overflow-y-auto p-2">
              {offeredFields.map(({ id, label, icon: Icon }) => (
                <Listbox.Item
                  key={id}
                  value={`${FIELD_OPTION}${id}`}
                  className="gap-2.5 rounded-sm px-3 py-2"
                >
                  {Icon !== undefined && (
                    <Icon
                      size={16}
                      strokeWidth={1.5}
                      className="text-subtle shrink-0"
                      aria-hidden
                    />
                  )}
                  <span className="truncate">{label}</span>
                </Listbox.Item>
              ))}

              {offeredGroups.map(({ label: groupLabel, values }) => (
                <Fragment key={groupLabel ?? ''}>
                  {groupLabel !== undefined && (
                    <Separator label={groupLabel} className="px-3 pt-2.5 pb-1 text-xs" />
                  )}

                  {values.map((candidate) => {
                    const selected = picked?.has(candidate.id) === true;

                    return (
                      <Listbox.Item
                        key={candidate.id}
                        value={`${VALUE_OPTION}${candidate.id}`}
                        // Picked or not, the value stays pickable: picking it again takes the term back.
                        disabled={!selected && !isOffered(candidate)}
                        // ? The listbox's own selection stays empty, so Enter keeps picking the option;
                        // ? the item spreads props after its own, which is what lets the state be said here.
                        aria-selected={selected}
                        className="rounded-sm px-3 py-2"
                      >
                        <span className="grow truncate">{candidate.label}</span>
                        {selected && (
                          <Check size={16} strokeWidth={2} className="shrink-0" aria-hidden />
                        )}
                        {candidate.count !== undefined && (
                          <span className="text-subtle tabular-nums">({candidate.count})</span>
                        )}
                      </Listbox.Item>
                    );
                  })}
                </Fragment>
              ))}
            </Combobox.ListContent>
          </Combobox.Popup>
        </Combobox.Portal>
      </Combobox.Content>
    </Combobox>
  );
}

FilterInput.displayName = FILTER_INPUT_NAME;

//
// * Internal
//

type FilterTextInputProps = {
  inputRef: RefObject<HTMLInputElement>;
  text: string;
  placeholder: string;
  onOpen: () => void;
  onEnter: () => void;
  onBackspace: () => void;
  /** Answers whether it consumed the key; otherwise the library closes the dropdown. */
  onEscape: () => boolean;
};

/**
 * The input, with the keys a tag input adds to a combobox's: Enter commits what was typed, Backspace
 * on an empty input takes the last tag back, Escape steps out of a field. Everything else — the arrows
 * into the list, Escape closing — is the library's, reached through its context.
 */
function FilterTextInput({
  inputRef,
  text,
  placeholder,
  onOpen,
  onEnter,
  onBackspace,
  onEscape,
}: FilterTextInputProps) {
  const { keyHandler } = useCombobox();

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' && text.length > 0) {
      event.preventDefault();
      onEnter();
      return;
    }

    if (event.key === 'Backspace' && text.length === 0) {
      onBackspace();
      return;
    }

    if (event.key === 'Escape' && onEscape()) {
      event.preventDefault();
      return;
    }

    keyHandler(event);
  };

  return (
    <Combobox.Input
      ref={inputRef}
      // The library's input names itself `Search` in English; the section's own prompt is the name here.
      aria-label={placeholder}
      placeholder={placeholder}
      className="bg-transparent"
      onFocus={onOpen}
      onKeyDown={handleKeyDown}
    />
  );
}
