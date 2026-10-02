/**
 * Whether a row's fields satisfy a free-text query: every whitespace-separated word of the query is
 * found, case-insensitive, in at least one of the fields. The words need not share a field or an order.
 *
 * ! An AND of words, not one phrase, so the client-side sections read a query the way the server
 * ! reads it: `findUsers` is sent `fulltext(…, "AND")`, which matches each word anywhere. Several
 * ! text tags join into one query, so a phrase match would have made two tags match only rows holding
 * ! them adjacent and in the order they were added.
 */
export function matchesEveryWord(query: string, fields: readonly (string | undefined)[]): boolean {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  if (words.length === 0) {
    return true;
  }

  const haystacks = fields.flatMap((field) => (field === undefined ? [] : [field.toLowerCase()]));

  return words.every((word) => haystacks.some((haystack) => haystack.includes(word)));
}
