import { describe, expect, it } from 'vitest';

import { derivePrincipalName, isIllegalPrincipalName } from './principal-name';

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

describe('isIllegalPrincipalName', () => {
  it('accepts what XP accepts', () => {
    expect(isIllegalPrincipalName('store.manager')).toBe(false);
    expect(isIllegalPrincipalName('store-manager_2')).toBe(false);
  });

  it('refuses a space and the key separator', () => {
    expect(isIllegalPrincipalName('store manager')).toBe(true);
    expect(isIllegalPrincipalName('store:manager')).toBe(true);
  });

  it('refuses the HTML specials and path characters PrincipalKey rejects', () => {
    for (const name of ['a<b', 'a>b', 'a&b', 'a"b', "a'b", 'a/b', 'a\\b', 'a|b', 'a?b', 'a*b']) {
      expect(isIllegalPrincipalName(name)).toBe(true);
    }
  });
});
