import { execute, type ExecutionResult } from '/lib/graphql';
import { countAliases } from '/lib/graphql-aliases';

import { schema } from './schema';

export type GraphQlRequest = { body?: string | null };

export type GraphQlResponse = {
  status: number;
  contentType: 'application/json';
  body: ExecutionResult | { message: string };
};

type GraphQlOperation = {
  query: string;
  variables?: Record<string, unknown>;
};

// ~8× the largest normal request: a Select-all delete of ~200 loaded rows, ~8 kB.
export const MAX_BODY_LENGTH = 65536;
export const MAX_ALIASES = 0;

/**
 * The sections' data plane, served from this app's own extension prefixes rather than from a
 * `kind: API` descriptor: a universal API is reachable from an admin tool page only when the *host
 * tool's* descriptor lists it, which would mean an app-settings release for every provider.
 *
 * ! No role check here, deliberately. Four gates already ran before this module was loaded, and
 * ! re-requiring a role would widen or narrow what they decided.
 */
export function handleGraphQlRequest(request: GraphQlRequest): GraphQlResponse {
  if (!request.body) {
    return badRequest('Request body is missing');
  }
  if (request.body.length > MAX_BODY_LENGTH) {
    return refused(413, 'Request body is too large');
  }

  let operation: unknown;
  try {
    operation = JSON.parse(request.body);
  } catch {
    return badRequest('Request body is not valid JSON');
  }

  if (!isGraphQlOperation(operation)) {
    return badRequest('Request body carries no `query` string');
  }

  if (countAliases(operation.query) > MAX_ALIASES) {
    return badRequest('Query uses more aliases than this endpoint allows');
  }

  // ! GraphQL answers 200 even when `errors` is populated — the client reads that array, not the
  // ! status. Only a malformed request gets a non-200 from here.
  // `operationName` is deliberately not read: lib-graphql's ExecutionInput ignores it.
  return {
    status: 200,
    contentType: 'application/json',
    body: execute(schema, operation.query, operation.variables),
  };
}

//
// * Internal
//

function isGraphQlOperation(value: unknown): value is GraphQlOperation {
  if (value == null || typeof value !== 'object') {
    return false;
  }
  const { query } = value as Partial<GraphQlOperation>;
  return typeof query === 'string' && query.length > 0;
}

function badRequest(message: string): GraphQlResponse {
  return refused(400, message);
}

function refused(status: number, message: string): GraphQlResponse {
  return { status, contentType: 'application/json', body: { message } };
}
