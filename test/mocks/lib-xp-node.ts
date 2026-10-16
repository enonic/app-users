import type {
  ConnectParams,
  Node,
  NodeQueryResult,
  QueryNodeParams,
  RepoConnection,
} from '@enonic-types/lib-node';
import { vi } from 'vitest';

export const query = vi.fn<(params: QueryNodeParams) => NodeQueryResult<undefined>>();

export const get = vi.fn<(keys: string[]) => Node | Node[] | null>();

export const connect = vi.fn<(params: ConnectParams) => RepoConnection>(
  () => ({ query, get }) as unknown as RepoConnection,
);

/** A query answer with the hits given and nothing else the report reads. */
export function hits(ids: readonly string[]): NodeQueryResult<undefined> {
  return {
    total: ids.length,
    count: ids.length,
    hits: ids.map((id) => ({ id, score: 1 })),
    aggregations: undefined,
  };
}
