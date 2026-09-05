import type { UserFormErrors, UserFormField } from './user-form';

export const USER_EDITOR_STEPS = {
  identity: 'step-identity',
  credentials: 'step-credentials',
  roles: 'step-roles',
  groups: 'step-groups',
  summary: 'step-summary',
} as const;

export type UserEditorStep = (typeof USER_EDITOR_STEPS)[keyof typeof USER_EDITOR_STEPS];

export const USER_EDITOR_STEP_ORDER: readonly UserEditorStep[] = Object.values(USER_EDITOR_STEPS);

/** The step titles, as phrase keys: the header reads one of these, the model resolves none of them. */
export const USER_EDITOR_STEP_TITLES: Record<UserEditorStep, string> = {
  [USER_EDITOR_STEPS.identity]: 'users.dialog.identity',
  [USER_EDITOR_STEPS.credentials]: 'users.dialog.credentials',
  [USER_EDITOR_STEPS.roles]: 'users.dialog.roles',
  [USER_EDITOR_STEPS.groups]: 'users.dialog.groups',
  [USER_EDITOR_STEPS.summary]: 'users.dialog.summary',
};

export const USER_EDITOR_STEP_FIELDS: Record<UserEditorStep, readonly UserFormField[]> = {
  [USER_EDITOR_STEPS.identity]: ['idProvider', 'displayName', 'name', 'email'],
  [USER_EDITOR_STEPS.credentials]: ['password'],
  [USER_EDITOR_STEPS.roles]: [],
  [USER_EDITOR_STEPS.groups]: [],
  [USER_EDITOR_STEPS.summary]: [],
};

export function userEditorStepHasError(errors: UserFormErrors, step: UserEditorStep): boolean {
  return USER_EDITOR_STEP_FIELDS[step].some((field) => errors[field] !== undefined);
}

/** The steps the wizard will not let the user reach yet. */
export function lockedUserEditorSteps(
  errors: UserFormErrors,
  busy: readonly UserFormField[] = [],
): Record<UserEditorStep, boolean> {
  const locks = {} as Record<UserEditorStep, boolean>;
  let blocked = false;

  for (const step of USER_EDITOR_STEP_ORDER) {
    locks[step] = blocked;
    blocked =
      blocked ||
      userEditorStepHasError(errors, step) ||
      USER_EDITOR_STEP_FIELDS[step].some((field) => busy.includes(field));
  }

  return locks;
}

/** The step the user has to go back to, when a submit finds the form still unanswered. */
export function firstUserEditorStepWithError(errors: UserFormErrors): UserEditorStep | undefined {
  return USER_EDITOR_STEP_ORDER.find((step) => userEditorStepHasError(errors, step));
}
