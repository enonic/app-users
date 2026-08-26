import { describe, expect, it } from 'vitest';

import { greeting } from './greeting';

describe('greeting', () => {
  it('names the app the placeholder stands for', () => {
    expect(greeting()).toContain('app-users');
  });
});
