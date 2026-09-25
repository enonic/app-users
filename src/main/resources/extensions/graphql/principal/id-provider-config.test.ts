import { describe, expect, it } from 'vitest';

import { parseIdProviderConfig } from './id-provider-config';

describe('parseIdProviderConfig', () => {
  it('keeps a tree of scalars and nested sets as it is', () => {
    const tree = [
      { name: 'clientId', type: 'String', values: [{ v: 'intranet' }] },
      { name: 'timeout', type: 'Long', values: [{ v: 30 }, {}] },
      {
        name: 'endpoints',
        type: 'PropertySet',
        values: [{ set: [{ name: 'url', type: 'String', values: [{ v: 'https://idp' }] }] }],
      },
    ];

    expect(parseIdProviderConfig(tree)).toEqual(tree);
  });

  it('reads missing values as none and a set value without a set as a null set', () => {
    expect(
      parseIdProviderConfig([
        { name: 'defaultGroups', type: 'Reference' },
        { name: 'endpoints', type: 'PropertySet', values: [{}] },
      ]),
    ).toEqual([
      { name: 'defaultGroups', type: 'Reference', values: [] },
      { name: 'endpoints', type: 'PropertySet', values: [{}] },
    ]);
  });

  it('drops a null scalar to an empty entry', () => {
    expect(parseIdProviderConfig([{ name: 'a', type: 'String', values: [{ v: null }] }])).toEqual([
      { name: 'a', type: 'String', values: [{}] },
    ]);
  });

  it('refuses a type XP does not know, naming where it sits', () => {
    expect(() =>
      parseIdProviderConfig([
        {
          name: 'endpoints',
          type: 'PropertySet',
          values: [{ set: [{ name: 'url', type: 'Url', values: [] }] }],
        },
      ]),
    ).toThrow('config[0].endpoints[0][0].url has an unknown type');
  });

  it.each([
    ['a tree that is not a list', { name: 'a' }],
    ['a property without a name', [{ type: 'String', values: [] }]],
    ['values that are not a list', [{ name: 'a', type: 'String', values: {} }]],
    ['a value that is not an object', [{ name: 'a', type: 'String', values: ['x'] }]],
    ['a scalar that is an object', [{ name: 'a', type: 'String', values: [{ v: { x: 1 } }] }]],
  ])('refuses %s', (_, json) => {
    expect(() => parseIdProviderConfig(json)).toThrow();
  });
});
