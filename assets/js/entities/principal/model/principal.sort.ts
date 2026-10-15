/**
 * The orders the Users and Groups lists offer. The ids are the values of the GraphQL `UserSort` enum,
 * so Users passes what the dropdown reports straight to the server.
 *
 * ! Both sections group by the provider's *name*, not by the display name their rows show. Users orders
 * ! on the server, where a node carries only the name, and Groups follows it: one option that grouped
 * ! the same instance in opposite orders in two neighbouring sections is the worse defect.
 */
export type PrincipalSort =
  | 'displayNameAsc'
  | 'displayNameDesc'
  | 'idProviderAsc'
  | 'idProviderDesc';

export const DEFAULT_PRINCIPAL_SORT: PrincipalSort = 'displayNameAsc';
