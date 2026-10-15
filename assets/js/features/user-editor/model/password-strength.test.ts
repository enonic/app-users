import { describe, expect, it } from 'vitest';

import { generatePassword, isPasswordAccepted, passwordStrength } from './password-strength';

describe('passwordStrength', () => {
  it('scores an empty field as nothing at all', () => {
    expect(passwordStrength('').score).toBe(0);
  });

  it('needs two classes and eight characters for weak', () => {
    expect(passwordStrength('abcdefg1').level).toBe('weak');
    expect(passwordStrength('abcdefg').level).toBe('tooWeak');
    expect(passwordStrength('abcdefgh').level).toBe('tooWeak');
  });

  it('needs all four classes and ten characters for medium', () => {
    expect(passwordStrength('Abcdefg1!!').level).toBe('medium');
    expect(passwordStrength('Abcdefg1!').level).toBe('weak');
    expect(passwordStrength('Abcdefgh!!').level).toBe('weak');
  });

  it('needs twelve characters for strong', () => {
    expect(passwordStrength('Abcdefg1!!!!').level).toBe('strong');
    expect(passwordStrength('Abcdefg1!!!').level).toBe('medium');
  });

  it('counts the symbols as a class of their own', () => {
    expect(passwordStrength('Abcdefgh1234').level).toBe('weak');
    expect(passwordStrength('Abcdefgh123~').level).toBe('strong');
  });

  it('names each level with its own phrase key', () => {
    expect(passwordStrength('abcdefg1').labelKey).toBe('users.dialog.strength.weak');
    expect(passwordStrength('Abcdefg1!!!!').labelKey).toBe('users.dialog.strength.strong');
  });
});

describe('isPasswordAccepted', () => {
  it('accepts medium and strong, and nothing below', () => {
    expect(isPasswordAccepted(passwordStrength('Abcdefg1!!'))).toBe(true);
    expect(isPasswordAccepted(passwordStrength('Abcdefg1!!!!'))).toBe(true);
    expect(isPasswordAccepted(passwordStrength('abcdefg1'))).toBe(false);
    expect(isPasswordAccepted(passwordStrength(''))).toBe(false);
  });
});

describe('generatePassword', () => {
  it('generates something the policy accepts', () => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      expect(isPasswordAccepted(passwordStrength(generatePassword()))).toBe(true);
    }
  });

  it('generates fifteen characters, as app-users did', () => {
    expect(generatePassword()).toHaveLength(15);
  });

  it('does not repeat itself', () => {
    const generated = new Set(Array.from({ length: 10 }, () => generatePassword()));

    expect(generated.size).toBe(10);
  });
});
