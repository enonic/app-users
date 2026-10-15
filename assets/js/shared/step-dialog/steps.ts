import type { FieldErrors } from '../form';

/** `title` is a phrase key. `fields` are what the step asks for; an error on one holds every later step back. */
export type StepDefinition<Field extends string> = {
  title: string;
  fields: readonly Field[];
};

export type StepTable<Step extends string, Field extends string> = {
  readonly [S in Step]: StepDefinition<Field>;
};

/**
 * `ids` names each step after its key. `allFields` is every claimed field in step order, what a rejected
 * save marks visited. `locked` closes everything behind a step with an error or a `busy` field — one
 * still being checked, with no verdict to show.
 */
export type Steps<Step extends string, Field extends string> = {
  ids: { readonly [S in Step]: S };
  order: readonly Step[];
  titles: Readonly<Record<Step, string>>;
  fields: Readonly<Record<Step, readonly Field[]>>;
  allFields: readonly Field[];
  hasError: (errors: FieldErrors<Field>, step: Step) => boolean;
  locked: (errors: FieldErrors<Field>, busy?: readonly Field[]) => Record<Step, boolean>;
  firstWithError: (errors: FieldErrors<Field>) => Step | undefined;
};

/** The steps of a dialog, in table order. The keys are the `step` values the library's `Dialog` navigates by. */
export function defineSteps<Step extends string, Field extends string>(
  table: StepTable<Step, Field>,
): Steps<Step, Field> {
  const order = Object.keys(table) as Step[];
  const ids = Object.fromEntries(order.map((step) => [step, step])) as { [S in Step]: S };
  const titles = Object.fromEntries(order.map((step) => [step, table[step].title])) as Record<
    Step,
    string
  >;
  const fields = Object.fromEntries(order.map((step) => [step, table[step].fields])) as Record<
    Step,
    readonly Field[]
  >;
  const allFields = order.flatMap((step) => fields[step]);

  const hasError = (errors: FieldErrors<Field>, step: Step): boolean =>
    fields[step].some((field) => errors[field] !== undefined);

  return {
    ids,
    order,
    titles,
    fields,
    allFields,
    hasError,

    locked(errors, busy = []) {
      const locks = {} as Record<Step, boolean>;
      let blocked = false;

      for (const step of order) {
        locks[step] = blocked;
        blocked =
          blocked || hasError(errors, step) || fields[step].some((field) => busy.includes(field));
      }

      return locks;
    },

    firstWithError(errors) {
      return order.find((step) => hasError(errors, step));
    },
  };
}
