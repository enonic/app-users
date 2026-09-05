import { atom, computed, map, type MapStore, type ReadableAtom } from 'nanostores';

import type { FieldErrors } from '../form';
import type { Steps } from './steps';

export type StepDialogMode = 'create' | 'edit';

/** `wizard` walks every step; `step` shows one alone, with Cancel and Save in place of the stepper. */
export type StepDialogView = 'wizard' | 'step';

export type StepDialogPayload<Entity> = { mode: 'create' } | { mode: 'edit'; entity: Entity };

/**
 * `saved` is the form as the server last answered it, what an edit diffs against. `seeded` says whether
 * the part of the baseline that arrives after the open has, so it is taken once.
 */
export type StepDialogState<Step extends string, Field extends string, Form, Entity> = {
  open: boolean;
  mode: StepDialogMode;
  view: StepDialogView;
  step: Step;
  form: Form;
  saved: Form;
  entity?: Entity;
  seeded: boolean;
  visited: ReadonlySet<Field>;
  saving: boolean;
};

/** What a rule outside the form reports: errors of its own, and the fields it has no verdict on yet. */
export type StepDialogExternal<Field extends string> = {
  errors: FieldErrors<Field>;
  busy: readonly Field[];
};

/**
 * The domain, injected. `next` settles a patched form before it is stored — a name derived from the
 * display name is the case. `same` is what makes an edit worth sending. `reset` runs on every open and
 * close, for what the feature keeps beside the form.
 */
export type StepDialogOptions<Step extends string, Field extends string, Form, Entity> = {
  steps: Steps<Step, Field>;
  initialForm: (payload: StepDialogPayload<Entity>) => Form;
  validate: (form: Form, context: { mode: StepDialogMode; entity?: Entity }) => FieldErrors<Field>;
  same: (saved: Form, edited: Form) => boolean;
  next?: (previous: Form, patched: Form, context: { mode: StepDialogMode }) => Form;
  $external?: ReadableAtom<StepDialogExternal<Field>>;
  reset?: () => void;
};

/**
 * `openAt` shows one step of an existing entity alone; a create needs every step. `seed` takes the late
 * part of the baseline once, into `saved` as well as `form`; `merge` keeps what the user picked while
 * the read was in flight, otherwise the seed wins.
 */
export type StepDialogStore<Step extends string, Field extends string, Form, Entity> = {
  steps: Steps<Step, Field>;
  $state: MapStore<StepDialogState<Step, Field, Form, Entity>>;
  $errors: ReadableAtom<FieldErrors<Field>>;
  $stepLocks: ReadableAtom<Record<Step, boolean>>;
  $changed: ReadableAtom<boolean>;
  open: (payload: StepDialogPayload<Entity>) => void;
  openAt: (entity: Entity, step: Step) => void;
  close: () => void;
  goToStep: (step: Step) => void;
  update: (patch: Partial<Form>) => void;
  seed: (
    patch: Partial<Form>,
    merge?: (seeded: Partial<Form>, current: Form) => Partial<Form>,
  ) => void;
  markVisited: (field: Field) => void;
  beginSave: () => void;
  endSave: () => void;
};

const NOTHING_EXTERNAL: StepDialogExternal<never> = { errors: {}, busy: [] };

/** A feature calls this once at module level and re-exports the pieces under its own names. */
export function createStepDialogStore<Step extends string, Field extends string, Form, Entity>({
  steps,
  initialForm,
  validate,
  same,
  next = (_previous, patched) => patched,
  $external = atom(NOTHING_EXTERNAL),
  reset,
}: StepDialogOptions<Step, Field, Form, Entity>): StepDialogStore<Step, Field, Form, Entity> {
  type State = StepDialogState<Step, Field, Form, Entity>;

  const firstStep = steps.order[0];
  if (firstStep === undefined) {
    throw new Error('A step dialog needs at least one step');
  }

  const initial: State = {
    open: false,
    mode: 'create',
    view: 'wizard',
    step: firstStep,
    form: initialForm({ mode: 'create' }),
    saved: initialForm({ mode: 'create' }),
    seeded: false,
    visited: new Set(),
    saving: false,
  };

  const $state = map<State>({ ...initial });

  // ! An external error never overrules a local one on the same field: the local message is the one to act on.
  const $errors = computed([$state, $external], ({ form, mode, entity }, external) => {
    const errors = validate(form, { mode, entity });

    for (const [field, key] of Object.entries(external.errors) as [Field, string][]) {
      if (errors[field] === undefined) {
        errors[field] = key;
      }
    }

    return errors;
  });

  const $stepLocks = computed([$errors, $external], (errors, external) =>
    steps.locked(errors, external.busy),
  );

  const $changed = computed(
    $state,
    ({ mode, saved, form }) => mode === 'create' || !same(saved, form),
  );

  return {
    steps,
    $state,
    $errors,
    $stepLocks,
    $changed,

    open(payload) {
      const form = initialForm(payload);

      reset?.();

      $state.set({
        ...initial,
        open: true,
        mode: payload.mode,
        entity: payload.mode === 'edit' ? payload.entity : undefined,
        form,
        saved: form,
      });
    },

    openAt(entity, step) {
      const form = initialForm({ mode: 'edit', entity });

      reset?.();

      $state.set({
        ...initial,
        open: true,
        mode: 'edit',
        view: 'step',
        step,
        entity,
        form,
        saved: form,
      });
    },

    close() {
      reset?.();
      $state.set({ ...initial });
    },

    goToStep(step) {
      $state.setKey('step', step);
    },

    update(patch) {
      const state = $state.get();

      $state.setKey('form', next(state.form, { ...state.form, ...patch }, { mode: state.mode }));
    },

    // ! Into `saved` too: a seeded member the user never touched is not an addition.
    seed(patch, merge = (seeded) => seeded) {
      const state = $state.get();

      if (state.seeded) {
        return;
      }

      $state.set({
        ...state,
        seeded: true,
        form: { ...state.form, ...merge(patch, state.form) },
        saved: { ...state.saved, ...patch },
      });
    },

    markVisited(field) {
      const { visited } = $state.get();

      if (!visited.has(field)) {
        $state.setKey('visited', new Set([...visited, field]));
      }
    },

    beginSave() {
      $state.setKey('saving', true);
    },

    endSave() {
      $state.setKey('saving', false);
    },
  };
}
