import { describe, expect, it } from 'vitest';

import {
  deriveIdProviderName,
  derivePrincipalName,
  isIllegalIdProviderName,
  isIllegalPrincipalName,
  isReservedIdProviderName,
  isReservedPrincipalName,
} from './principal-name';

// XP stores a principal under its key lowercased as the node id, which must match `[a-z0-9_.:-]+`.
const ALLOWED = /[A-Za-z0-9_.-]/;

const ASCII = Array.from({ length: 0x80 }, (_, code) => code);

const NON_ASCII = [
  'и',
  'П',
  'ё',
  'å',
  'æ',
  'ø',
  'Ø',
  'é',
  'ß',
  'ı',
  'İ',
  'ł',
  'œ',
  'þ',
  'ẞ',
  'ﬁ',
  '²',
  'Ⅻ',
  '㎒',
  '\u212A',
  'Ａ',
  '\u00A0',
  '\u200B',
  '\u0301',
  '😀',
];

describe('derivePrincipalName', () => {
  it('lowercases and joins words with dots', () => {
    expect(derivePrincipalName('Store Manager')).toBe('store.manager');
  });

  it('collapses runs of whitespace into one dot', () => {
    expect(derivePrincipalName('Store   Floor  Manager')).toBe('store.floor.manager');
  });

  it('turns what a principal id may not carry into a separator', () => {
    expect(derivePrincipalName('Sales & Ops <EU>')).toBe('sales.ops.eu');
  });

  it('answers empty for a display name that is only whitespace', () => {
    expect(derivePrincipalName('   ')).toBe('');
  });

  it.each([
    ['Café #1', 'cafe.1'],
    ['user@mail.com', 'user.mail.com'],
    ['50% off $ale', '50.off.ale'],
    ['İstanbul', 'istanbul'],
    ['Ødegård', 'odegard'],
    ['Blåbær', 'blabaer'],
    ['Søren Ærø', 'soren.aero'],
    ['Łukasz Wałęsa', 'lukasz.walesa'],
    ['Straße', 'strasse'],
    ['ﬁle', 'file'],
    ['x²', 'x2'],
    ['a - b', 'a-b'],
    ['Corp. Directory', 'corp.directory'],
    ['Admin Пётр', 'admin'],
    ['Иван Петров', ''],
  ])('derives %s as %s', (displayName, name) => {
    expect(derivePrincipalName(displayName)).toBe(name);
  });

  // Wrapped, so no single character derives to a name XP reserves, such as `.` alone.
  it.each([...ASCII.map((code) => String.fromCodePoint(code)), ...NON_ASCII])(
    'derives a name XP accepts from a display name carrying %j',
    (char) => {
      const name = derivePrincipalName(`a${char}b`);

      expect(isIllegalPrincipalName(name)).toBe(false);
    },
  );
});

describe('deriveIdProviderName', () => {
  it.each([
    ['My Provider', 'my-provider'],
    ['My.Provider', 'my-provider'],
    ['Café #1', 'cafe-1'],
    ['Corp. Directory', 'corp-directory'],
    ['Søren Ærø', 'soren-aero'],
    ['a - b', 'a-b'],
    ['a _ b', 'a_b'],
    ['Иван', ''],
    ['   ', ''],
  ])('derives %s as %s', (displayName, name) => {
    expect(deriveIdProviderName(displayName)).toBe(name);
  });

  it.each([...ASCII.map((code) => String.fromCodePoint(code)), ...NON_ASCII])(
    'derives an undotted name XP accepts from a display name carrying %j',
    (char) => {
      const name = deriveIdProviderName(`a${char}b`);

      expect(name).not.toContain('.');
      expect(isIllegalIdProviderName(name)).toBe(false);
    },
  );
});

describe('isIllegalPrincipalName', () => {
  it.each(ASCII)('accepts code point %i only if XP can store it', (code) => {
    const char = String.fromCodePoint(code);

    expect(isIllegalPrincipalName(`a${char}b`)).toBe(!ALLOWED.test(char));
  });

  it.each(['иван', 'Пользователь', 'admin.пётр'])('refuses the Russian %s', (name) => {
    expect(isIllegalPrincipalName(name)).toBe(true);
  });

  it.each(['blåbær', 'Ødegård', 'smør'])('refuses the Norwegian %s', (name) => {
    expect(isIllegalPrincipalName(name)).toBe(true);
  });

  it.each([
    ['an accented letter', 'café'],
    ['sharp s', 'straße'],
    ['dotless i', 'ı'],
    ['dotted capital I', 'İ'],
    ['the Kelvin sign', 'K'],
    ['a fullwidth letter', 'Ａ'],
    ['a no-break space', 'a b'],
    ['a zero-width space', 'a​b'],
    ['a combining accent', 'é'],
    ['an emoji', 'a😀b'],
    ['a tab', 'a\tb'],
    ['a newline', 'a\nb'],
  ])('refuses %s', (_label, name) => {
    expect(isIllegalPrincipalName(name)).toBe(true);
  });

  it.each(['store.manager', 'Store-Manager_2', '-a', 'a-', '.a', 'a.', '_a', '-', '__', '...'])(
    'accepts %s, wherever the allowed characters stand',
    (name) => {
      expect(isIllegalPrincipalName(name)).toBe(false);
    },
  );

  it('refuses an empty name', () => {
    expect(isIllegalPrincipalName('')).toBe(true);
  });

  it.each(['_', '.', '..'])('refuses %s, which XP reserves', (name) => {
    expect(isIllegalPrincipalName(name)).toBe(true);
  });

  it('leaves roles to principals', () => {
    expect(isIllegalPrincipalName('roles')).toBe(false);
  });
});

describe('isIllegalIdProviderName', () => {
  it.each(['a#b', 'иван', '_', '.', '..', 'roles', 'ROLES', 'Roles'])('refuses %s', (name) => {
    expect(isIllegalIdProviderName(name)).toBe(true);
  });

  it.each(['my-idp', 'Company.Directory_2', 'roles2', 'my.roles'])('accepts %s', (name) => {
    expect(isIllegalIdProviderName(name)).toBe(false);
  });
});

describe('isReservedPrincipalName', () => {
  it.each(['_', '.', '..'])('reserves %s', (name) => {
    expect(isReservedPrincipalName(name)).toBe(true);
  });

  it.each(['...', '__', 'roles', 'a#b'])('leaves %s to the other checks', (name) => {
    expect(isReservedPrincipalName(name)).toBe(false);
  });
});

describe('isReservedIdProviderName', () => {
  it.each(['_', '.', '..', 'roles', 'ROLES', 'Roles'])('reserves %s', (name) => {
    expect(isReservedIdProviderName(name)).toBe(true);
  });

  it.each(['...', '__', 'roles2', 'my.roles', 'a#b'])('leaves %s to the other checks', (name) => {
    expect(isReservedIdProviderName(name)).toBe(false);
  });
});
