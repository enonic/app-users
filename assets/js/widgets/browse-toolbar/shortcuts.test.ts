import { describe, expect, it } from 'vitest';

import { matchesShortcut, type ShortcutEvent } from './shortcuts';

const NEW = { code: 'KeyN', alt: true };
const DELETE = { code: 'Delete', mod: true };

function key(overrides: Partial<ShortcutEvent>): ShortcutEvent {
  return { code: '', altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, ...overrides };
}

describe('matchesShortcut', () => {
  it('matches the physical key, since Alt+N types a dead character on macOS', () => {
    expect(matchesShortcut(NEW, key({ code: 'KeyN', altKey: true }), true)).toBe(true);
  });

  it('reads Mod as Ctrl off a Mac and as Cmd on one', () => {
    expect(matchesShortcut(DELETE, key({ code: 'Delete', ctrlKey: true }), false)).toBe(true);
    expect(matchesShortcut(DELETE, key({ code: 'Delete', metaKey: true }), true)).toBe(true);
  });

  it("refuses the other platform's modifier", () => {
    expect(matchesShortcut(DELETE, key({ code: 'Delete', metaKey: true }), false)).toBe(false);
    expect(matchesShortcut(DELETE, key({ code: 'Delete', ctrlKey: true }), true)).toBe(false);
  });

  it('refuses a chord with a modifier missing or to spare', () => {
    expect(matchesShortcut(NEW, key({ code: 'KeyN' }), false)).toBe(false);
    expect(matchesShortcut(NEW, key({ code: 'KeyN', altKey: true, shiftKey: true }), false)).toBe(
      false,
    );
  });

  it('does not take Backspace for Delete', () => {
    expect(matchesShortcut(DELETE, key({ code: 'Backspace', ctrlKey: true }), false)).toBe(false);
  });
});
