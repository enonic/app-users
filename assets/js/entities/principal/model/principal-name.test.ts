import { describe, expect, it } from 'vitest';

import {
  derivePrincipalName,
  isIllegalIdProviderName,
  isIllegalPrincipalName,
} from './principal-name';

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
});

// XP stores a principal under its key lowercased as the node id, which must match `[a-z0-9_.:-]+`.
const ALLOWED = /[A-Za-z0-9_.-]/;

const ASCII = Array.from({ length: 0x80 }, (_, code) => code);

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
