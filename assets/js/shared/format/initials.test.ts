import { describe, expect, it } from 'vitest';

import { getInitials } from './initials';

describe('getInitials', () => {
  it('takes the first letter of the first two words', () => {
    expect(getInitials('Aliaksandr Shklianko')).toBe('AS');
  });

  it('ignores a third word rather than the second, as Content Studio does', () => {
    expect(getInitials('John Ronald Tolkien')).toBe('JR');
  });

  it('takes the first two letters of a one-word name', () => {
    expect(getInitials('anonymous')).toBe('AN');
  });

  it('gives what it has for a one-letter name', () => {
    expect(getInitials('x')).toBe('X');
  });

  it('survives surrounding and repeated whitespace', () => {
    expect(getInitials('  jane   doe ')).toBe('JD');
  });

  it('is empty for an empty name', () => {
    expect(getInitials('   ')).toBe('');
  });
});
