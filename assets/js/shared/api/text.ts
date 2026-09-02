import { AppError, RequestAbortedError, RequestError } from '@enonic/ui-utils';
import { ResultAsync } from 'neverthrow';

/**
 * A body that is not JSON — the permission report's CSV is the only one.
 *
 * ? Fetched rather than linked to. An anchor pointed at the endpoint would download whatever comes
 * ? back, a refusal included, leaving the section with a file named like a report and no way to say
 * ? what went wrong. Read through here, a failure is a value like any other and reaches a toast.
 */
export function requestText(
  url: string,
  options: { signal?: AbortSignal } = {},
): ResultAsync<string, AppError> {
  const { signal } = options;
  return ResultAsync.fromPromise(
    fetch(url, { signal }).then(async (response) => {
      if (!response.ok) {
        const fallback = response.statusText || `Request failed with status ${response.status}`;
        throw new RequestError((await readErrorMessage(response)) ?? fallback, response.status);
      }
      return response.text();
    }),
    (error) => toAppError(error, signal),
  );
}

//
// * Internal
//

async function readErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json();
    if (body != null && typeof body === 'object' && 'message' in body) {
      const { message } = body as { message?: unknown };
      return typeof message === 'string' && message.length > 0 ? message : undefined;
    }
  } catch {}
  return undefined;
}

function toAppError(error: unknown, signal: AbortSignal | undefined): AppError {
  if (signal?.aborted === true) {
    return new RequestAbortedError(undefined, error);
  }
  return error instanceof AppError ? error : new AppError(String(error), error);
}
