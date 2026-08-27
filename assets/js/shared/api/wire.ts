import { err, ok, type Result } from 'neverthrow';

import { AppError } from './errors';

/**
 * An empty string on the wire is absence, not a value.
 *
 * A details panel omits a field it has no value for and would otherwise render a blank one, so the
 * distinction has to be made where the DTO is read rather than where it is shown.
 */
export function nonEmpty(value: string | null): string | undefined {
  return value != null && value.length > 0 ? value : undefined;
}

/**
 * The domain object a mutation answered with, or a failure naming what did not happen.
 *
 * ! A write that answered null is a failure, unlike a read of one item: nothing says whether it happened.
 */
export function written<D, T>(
  dto: D | null,
  toDomain: (dto: D) => T,
  message: string,
): Result<T, AppError> {
  return dto == null ? err(new AppError(message)) : ok(toDomain(dto));
}
