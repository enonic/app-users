import type { LucideIcon } from 'lucide-react';

import { isTextTerm, type FilterTerm } from '../../shared/filter';

export type FilterValue = {
  id: string;
  label: string;
  /**
   * How many rows fall under this value, where that is knowable.
   *
   * ! Absent, not zero, where nothing can count: a value without a count is always offered — there is
   * ! nothing to tell it apart from an empty one.
   */
  count?: number;
  /** Values sharing a group are listed together under its label, after the ungrouped ones. */
  group?: string;
};

/** A run of values the dropdown lists together: the ungrouped ones first and unlabelled, then each group. */
export type FilterValueGroup = {
  label?: string;
  values: readonly FilterValue[];
};

/** A field the filter offers, with the values it can take. Section-agnostic by construction. */
export type FilterField = {
  id: string;
  label: string;
  icon?: LucideIcon;
  values: readonly FilterValue[];
};

/** What a tag shows for a term: the labels, falling back to the ids for a field or value no longer offered. */
export type TermLabel = {
  field?: string;
  value: string;
};

/** Whether a value can be picked: one with a count of zero would narrow the list to nothing. */
export function isOffered({ count }: FilterValue): boolean {
  return count === undefined || count > 0;
}

/**
 * The values by hits, most first, the ones with none last. A value without a count comes first: it is
 * offered whatever the rows, so it must not sink below the empty ones. Ties keep the field's own order.
 */
export function orderedValues(values: readonly FilterValue[]): FilterValue[] {
  return [...values].sort((a, b) => rank(b) - rank(a));
}

function rank({ count }: FilterValue): number {
  return count ?? Number.POSITIVE_INFINITY;
}

/**
 * The values as the dropdown lists them: the ungrouped ones first, then every group in the order it
 * first appears, each run ordered by hits on its own — a group's empty values sink to its end, not
 * to the end of the list, or the group would lose them to the one below.
 */
export function groupedValues(values: readonly FilterValue[]): FilterValueGroup[] {
  const runs = new Map<string | undefined, FilterValue[]>([[undefined, []]]);
  for (const value of values) {
    const run = runs.get(value.group);
    if (run === undefined) {
      runs.set(value.group, [value]);
    } else {
      run.push(value);
    }
  }

  return [...runs]
    .filter(([, run]) => run.length > 0)
    .map(([label, run]) => ({ label, values: orderedValues(run) }));
}

/** The fields whose label contains what was typed, case-insensitive; every field for a blank. */
export function matchingFields(fields: readonly FilterField[], typed: string): FilterField[] {
  const needle = typed.trim().toLowerCase();
  return needle.length === 0
    ? [...fields]
    : fields.filter(({ label }) => label.toLowerCase().includes(needle));
}

export function matchingValues(values: readonly FilterValue[], typed: string): FilterValue[] {
  const needle = typed.trim().toLowerCase();
  return needle.length === 0
    ? [...values]
    : values.filter(({ label }) => label.toLowerCase().includes(needle));
}

/** The field a typed `Label:` names, once the colon is typed; case-insensitive on the label. */
export function fieldTyped(fields: readonly FilterField[], typed: string): FilterField | undefined {
  if (!typed.endsWith(':')) {
    return undefined;
  }

  const label = typed.slice(0, -1).trim().toLowerCase();
  return fields.find((field) => field.label.toLowerCase() === label);
}

export function termLabel(term: FilterTerm, fields: readonly FilterField[]): TermLabel {
  if (isTextTerm(term)) {
    return { value: term.text };
  }

  const field = fields.find(({ id }) => id === term.field);
  const value = field?.values.find(({ id }) => id === term.value);

  return { field: field?.label ?? term.field, value: value?.label ?? term.value };
}
