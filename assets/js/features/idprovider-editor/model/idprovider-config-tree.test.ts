import { Form } from '@enonic/input-types/schema';
import type { FormJson } from '@enonic/ui-types';
import { describe, expect, it } from 'vitest';

import {
  isConfigChanged,
  isConfigValid,
  openConfigTree,
  savedConfigOf,
} from './idprovider-config-tree';

const FORM: FormJson = [
  {
    formItemType: 'Input',
    name: 'clientId',
    label: 'Client ID',
    inputType: 'TextLine',
    occurrences: { minimum: 1, maximum: 1 },
    config: {},
  },
  {
    formItemType: 'ItemSet',
    name: 'claimMappings',
    label: 'Claim mappings',
    occurrences: { minimum: 0, maximum: 0 },
    items: [
      {
        formItemType: 'Input',
        name: 'claim',
        label: 'Claim',
        inputType: 'TextLine',
        occurrences: { minimum: 1, maximum: 1 },
        config: {},
      },
      {
        formItemType: 'Input',
        name: 'attribute',
        label: 'Attribute',
        inputType: 'TextLine',
        occurrences: { minimum: 0, maximum: 1 },
        config: {},
      },
    ],
  },
];

function form(): Form {
  return Form.fromJson(FORM, 'com.example.test');
}

describe('isConfigValid', () => {
  it('holds once every required input has a value', () => {
    const tree = openConfigTree(form(), []);
    tree.setStringByPath('clientId', 'intranet');

    expect(isConfigValid(form(), tree)).toBe(true);
  });

  it('fails while a required input at the root is empty', () => {
    const tree = openConfigTree(form(), []);

    expect(isConfigValid(form(), tree)).toBe(false);
  });

  it('fails while an added item-set occurrence leaves its required input empty', () => {
    const tree = openConfigTree(form(), []);
    tree.setStringByPath('clientId', 'intranet');
    tree.getRoot().addPropertySet('claimMappings');

    expect(isConfigValid(form(), tree)).toBe(false);
  });

  it('holds again once the occurrence is filled in', () => {
    const tree = openConfigTree(form(), []);
    tree.setStringByPath('clientId', 'intranet');
    tree.getRoot().addPropertySet('claimMappings');
    tree.setStringByPath('claimMappings[0].claim', 'email');

    expect(isConfigValid(form(), tree)).toBe(true);
  });
});

describe('savedConfigOf', () => {
  it('writes the tree as typed properties, an untouched set as an empty array', () => {
    const tree = openConfigTree(form(), []);
    tree.setStringByPath('clientId', 'intranet');

    expect(savedConfigOf(tree)).toEqual([
      { name: 'clientId', type: 'String', values: [{ v: 'intranet' }] },
      { name: 'claimMappings', type: 'PropertySet', values: [] },
    ]);
  });
});

describe('isConfigChanged', () => {
  it('sees nothing while the tree writes what it opened with, defaults included', () => {
    const tree = openConfigTree(form(), []);

    expect(isConfigChanged(tree, savedConfigOf(tree))).toBe(false);
  });

  it('sees a value typed into the tree', () => {
    const tree = openConfigTree(form(), []);
    const opened = savedConfigOf(tree);

    tree.setStringByPath('clientId', 'intranet');

    expect(isConfigChanged(tree, opened)).toBe(true);
  });
});
