/**
 * One term of a filter: a value of a named field, or free text. Ids, never labels — what a term
 * is called is the business of whoever offers the fields.
 */
export type FilterTerm = { field: string; value: string } | { text: string };

/** What a section's list is narrowed by, in the order the terms were added. */
export type FilterQuery = readonly FilterTerm[];

export const EMPTY_FILTER: FilterQuery = [];

export function isTextTerm(term: FilterTerm): term is { text: string } {
  return 'text' in term;
}

/** The free text of a query as one string, the text terms joined by a space. */
export function textOf(query: FilterQuery): string {
  return query
    .filter(isTextTerm)
    .map(({ text }) => text)
    .join(' ');
}

/** Every value the query holds for a field. Empty narrows nothing, the reading every multi-select filter takes. */
export function valuesOf(query: FilterQuery, field: string): ReadonlySet<string> {
  const values = new Set<string>();
  for (const term of query) {
    if (!isTextTerm(term) && term.field === field) {
      values.add(term.value);
    }
  }
  return values;
}

export function sameTerm(a: FilterTerm, b: FilterTerm): boolean {
  if (isTextTerm(a) || isTextTerm(b)) {
    return isTextTerm(a) && isTextTerm(b) && a.text === b.text;
  }

  return a.field === b.field && a.value === b.value;
}

/** A text term from what was typed, or nothing for a blank. */
export function textTerm(typed: string): FilterTerm | undefined {
  const text = typed.trim();
  return text.length === 0 ? undefined : { text };
}

/** The query with a term added at the end; one it already holds leaves it unchanged. */
export function withTerm(query: FilterQuery, term: FilterTerm): FilterQuery {
  return query.some((held) => sameTerm(held, term)) ? query : [...query, term];
}

export function withoutTerm(query: FilterQuery, index: number): FilterQuery {
  return query.filter((_, at) => at !== index);
}

/** The query with a term taken out if it holds it, and added at the end if it does not. */
export function toggledTerm(query: FilterQuery, term: FilterTerm): FilterQuery {
  const held = query.some((candidate) => sameTerm(candidate, term));
  return held ? query.filter((candidate) => !sameTerm(candidate, term)) : [...query, term];
}
