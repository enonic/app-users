import { isApplePlatform, matchesShortcut, type Shortcut, type ShortcutEvent } from './shortcuts';

export type ActionContext<T> = {
  selected: readonly T[];
  active: T | undefined;
};

/**
 * What a section declares. A key rather than a label, because the list is a module constant: a phrase
 * resolved there would resolve before the shell has published any.
 */
export type SectionAction<T> = {
  id: string;
  labelKey: string;
  /** Pure — no I/O, no store reads. Unit-tested per section. */
  enabled: (ctx: ActionContext<T>) => boolean;
  run: (ctx: ActionContext<T>) => void | Promise<void>;
  /**
   * Runs when a row is activated, which today means double-clicked. At most one action per section
   * carries it, and its own `enabled` still decides: a double click is a shortcut to an action the
   * user already has, never a way past its rules.
   */
  activatedByRow?: boolean;
  /**
   * The chord that runs it from anywhere in the screen but a text field. As with `activatedByRow`, its
   * own `enabled` still decides: when the button is disabled, the key does nothing.
   */
  shortcut?: Shortcut;
};

/** What the toolbar and the row menu render: the same action with its label resolved. */
export type LabelledAction<T> = SectionAction<T> & { label: string };

/**
 * What an action applies to: the ticked rows, or the active row when nothing is ticked.
 * Content Studio calls the same thing its current items, and the toolbar and the row context
 * menu both read it, so right-clicking a row is enough to act on it.
 */
export function actionTargets<T>({ selected, active }: ActionContext<T>): readonly T[] {
  if (selected.length > 0) {
    return selected;
  }

  return active === undefined ? [] : [active];
}

/** The action a row activation runs, if the section declared one and it is allowed right now. */
export function rowActivationAction<T>(
  actions: readonly SectionAction<T>[],
  ctx: ActionContext<T>,
): SectionAction<T> | undefined {
  const action = actions.find(({ activatedByRow }) => activatedByRow === true);

  return action !== undefined && action.enabled(ctx) ? action : undefined;
}

/** The action a key chord runs, if the section bound one to it and it is allowed right now. */
export function shortcutAction<T>(
  actions: readonly SectionAction<T>[],
  ctx: ActionContext<T>,
  event: ShortcutEvent,
  apple = isApplePlatform(),
): SectionAction<T> | undefined {
  const action = actions.find(
    ({ shortcut }) => shortcut !== undefined && matchesShortcut(shortcut, event, apple),
  );

  return action !== undefined && action.enabled(ctx) ? action : undefined;
}
