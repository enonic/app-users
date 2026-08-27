export type FieldErrors<F extends string> = Partial<Record<F, string>>;

export function visitedErrors<F extends string>(
  errors: FieldErrors<F>,
  visited: ReadonlySet<F>,
): FieldErrors<F> {
  const shown: FieldErrors<F> = {};

  for (const [field, key] of Object.entries(errors) as [F, string][]) {
    if (visited.has(field)) {
      shown[field] = key;
    }
  }

  return shown;
}
