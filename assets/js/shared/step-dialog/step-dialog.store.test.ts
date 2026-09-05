import { atom } from 'nanostores';
import { afterEach, describe, expect, it } from 'vitest';

import type { FieldErrors } from '../form';
import { createStepDialogStore, type StepDialogExternal } from './step-dialog.store';
import { defineSteps } from './steps';

type Field = 'name' | 'displayName' | 'email';
type Form = {
  name: string;
  displayName: string;
  email: string;
  members: readonly string[];
  nameEdited: boolean;
};
type Entity = { key: string; displayName: string; members: readonly string[] };

const STEPS = defineSteps<'identity' | 'members' | 'summary', Field>({
  identity: { title: 'dialog.identity', fields: ['name', 'displayName', 'email'] },
  members: { title: 'dialog.members', fields: [] },
  summary: { title: 'dialog.summary', fields: [] },
});

const ALICE: Entity = { key: 'alice', displayName: 'Alice', members: ['bob'] };

const $external = atom<StepDialogExternal<Field>>({ errors: {}, busy: [] });

let resets = 0;

const store = createStepDialogStore<'identity' | 'members' | 'summary', Field, Form, Entity>({
  steps: STEPS,
  initialForm: (payload) =>
    payload.mode === 'create'
      ? { name: '', displayName: '', email: '', members: [], nameEdited: false }
      : {
          name: payload.entity.key,
          displayName: payload.entity.displayName,
          email: '',
          members: [],
          nameEdited: true,
        },
  validate: (form, { mode }) => {
    const errors: FieldErrors<Field> = {};
    if (form.displayName.length === 0) {
      errors.displayName = 'dialog.displayNameRequired';
    }
    if (mode === 'create' && form.name.length === 0) {
      errors.name = 'dialog.nameRequired';
    }
    return errors;
  },
  same: (saved, edited) =>
    saved.displayName === edited.displayName &&
    saved.email === edited.email &&
    [...saved.members].sort().join() === [...edited.members].sort().join(),
  next: (previous, patched, { mode }) =>
    mode === 'create' && patched.name === previous.name && !patched.nameEdited
      ? { ...patched, name: patched.displayName.toLowerCase().replace(/\s+/g, '.') }
      : { ...patched, nameEdited: patched.nameEdited || patched.name !== previous.name },
  $external,
  reset: () => {
    resets += 1;
  },
});

afterEach(() => {
  store.close();
  $external.set({ errors: {}, busy: [] });
  resets = 0;
});

describe('open', () => {
  it('opens the whole wizard at its first step', () => {
    store.open({ mode: 'create' });

    const { open, mode, view, step, entity } = store.$state.get();

    expect({ open, mode, view, step, entity }).toEqual({
      open: true,
      mode: 'create',
      view: 'wizard',
      step: 'identity',
      entity: undefined,
    });
  });

  it('seeds an edit from the entity, with nothing to save until something changes', () => {
    store.open({ mode: 'edit', entity: ALICE });

    const { form, saved, entity } = store.$state.get();

    expect(entity).toBe(ALICE);
    expect(form.name).toBe('alice');
    expect(saved).toEqual(form);
    expect(store.$changed.get()).toBe(false);
  });

  it('resets what the feature keeps beside the form, on open and on close', () => {
    store.open({ mode: 'create' });
    store.close();

    expect(resets).toBe(2);
  });
});

describe('openAt', () => {
  it('opens one step of an existing entity alone', () => {
    store.openAt(ALICE, 'members');

    const { open, mode, view, step, entity } = store.$state.get();

    expect({ open, mode, view, step }).toEqual({
      open: true,
      mode: 'edit',
      view: 'step',
      step: 'members',
    });
    expect(entity).toBe(ALICE);
  });

  it('leaves the wizard behind it, so the next open walks every step again', () => {
    store.openAt(ALICE, 'members');
    store.close();
    store.open({ mode: 'create' });

    expect(store.$state.get().view).toBe('wizard');
  });
});

describe('update', () => {
  it('stores what `next` settles the patched form to', () => {
    store.open({ mode: 'create' });
    store.update({ displayName: 'Store Manager' });

    expect(store.$state.get().form.name).toBe('store.manager');
  });

  it('hands `next` the previous form and the mode', () => {
    store.open({ mode: 'create' });
    store.update({ name: 'boss' });
    store.update({ displayName: 'Store Manager' });
    expect(store.$state.get().form.name).toBe('boss');

    store.open({ mode: 'edit', entity: ALICE });
    store.update({ displayName: 'Alice Cooper' });
    expect(store.$state.get().form.name).toBe('alice');
    expect(store.$changed.get()).toBe(true);
  });
});

describe('seed', () => {
  it('joins the baseline as well as the form, once', () => {
    store.open({ mode: 'edit', entity: ALICE });
    store.seed({ members: ['bob'] });
    store.seed({ members: ['carol'] });

    const { form, saved, seeded } = store.$state.get();

    expect(seeded).toBe(true);
    expect(form.members).toEqual(['bob']);
    expect(saved.members).toEqual(['bob']);
    expect(store.$changed.get()).toBe(false);
  });

  it('keeps what the user picked while the read was in flight, through merge', () => {
    store.open({ mode: 'edit', entity: ALICE });
    store.update({ members: ['dave'] });
    store.seed({ members: ['bob'] }, (seeded, current) => ({
      members: [...(seeded.members ?? []), ...current.members],
    }));

    const { form, saved } = store.$state.get();

    expect(form.members).toEqual(['bob', 'dave']);
    expect(saved.members).toEqual(['bob']);
    expect(store.$changed.get()).toBe(true);
  });
});

describe('$errors and $stepLocks', () => {
  it('merges an external error onto a field the local validation accepted', () => {
    store.open({ mode: 'create' });
    store.update({ displayName: 'Alice' });
    $external.set({ errors: { name: 'dialog.nameTaken' }, busy: [] });

    expect(store.$errors.get()).toEqual({ name: 'dialog.nameTaken' });
    expect(store.$stepLocks.get().members).toBe(true);
  });

  it('lets a local message stand over an external one on the same field', () => {
    store.open({ mode: 'create' });
    $external.set({ errors: { name: 'dialog.nameTaken' }, busy: [] });

    expect(store.$errors.get().name).toBe('dialog.nameRequired');
  });

  it('holds the later steps back while an external rule is still checking', () => {
    store.open({ mode: 'create' });
    store.update({ displayName: 'Alice' });
    $external.set({ errors: {}, busy: ['name'] });

    expect(store.$errors.get()).toEqual({});
    expect(store.$stepLocks.get()).toEqual({ identity: false, members: true, summary: true });
  });
});

describe('markVisited', () => {
  it('collects the fields the user has been through', () => {
    store.open({ mode: 'create' });
    store.markVisited('name');
    store.markVisited('name');
    store.markVisited('email');

    expect([...store.$state.get().visited]).toEqual(['name', 'email']);
  });
});
