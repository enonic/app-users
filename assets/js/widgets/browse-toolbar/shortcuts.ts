/** A key chord. `mod` is Cmd on Apple platforms and Ctrl elsewhere, as Content Studio's `mod+del`. */
export type Shortcut = {
  code: string;
  alt?: boolean;
  mod?: boolean;
};

export type ShortcutEvent = Pick<
  KeyboardEvent,
  'code' | 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'
>;

export function matchesShortcut(
  { code, alt = false, mod = false }: Shortcut,
  event: ShortcutEvent,
  apple: boolean,
): boolean {
  const modKey = apple ? event.metaKey : event.ctrlKey;
  const otherKey = apple ? event.ctrlKey : event.metaKey;

  return (
    event.code === code && event.altKey === alt && modKey === mod && !otherKey && !event.shiftKey
  );
}

export function isApplePlatform(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform);
}

/** Where a key types rather than acts. */
export function isTextEntry(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.matches(TEXT_INPUT_SELECTOR) || target.isContentEditable)
  );
}

//
// * Internal
//

// ? Not every input: the select-all checkbox is one, and a mouse click leaves focus on it.
const TEXT_INPUT_SELECTOR = 'input:not([type=checkbox], [type=radio]), textarea';
