import {
  normalizeFormValueTypes,
  pruneUnselectedOptionData,
  seedFormDefaults,
  validateForm,
} from '@enonic/input-types';
import { PropertyTree } from '@enonic/input-types/data';
import type { Form } from '@enonic/input-types/schema';
import type { PropertyTreeJson } from '@enonic/ui-types';

import { CONFIG_INPUT_TYPES } from './idprovider-config-types';

/**
 * The tree the dialog edits: the stored values in the types the form declares now, and the form's defaults
 * where nothing is stored.
 */
export function openConfigTree(form: Form, config: PropertyTreeJson): PropertyTree {
  const tree = PropertyTree.fromJson(config);
  normalizeFormValueTypes(form, tree.getRoot(), { registry: CONFIG_INPUT_TYPES });
  seedFormDefaults(form, tree.getRoot(), { registry: CONFIG_INPUT_TYPES });
  return tree;
}

export function isConfigValid(form: Form, tree: PropertyTree): boolean {
  return validateForm(form, tree.getRoot(), { registry: CONFIG_INPUT_TYPES }).isValid;
}

/**
 * Whether the tree now writes anything other than `opened`, the tree as the dialog opened it. Both sides
 * come out of `PropertyTree.toJson`, which writes a tree the same way every time.
 */
export function isConfigChanged(tree: PropertyTree, opened: PropertyTreeJson): boolean {
  return JSON.stringify(savedConfigOf(tree)) !== JSON.stringify(opened);
}

/** The tree as it is written: an option set's deselected options leave their data behind. */
export function savedConfigOf(tree: PropertyTree): PropertyTreeJson {
  const copy = PropertyTree.fromJson(tree.toJson());
  pruneUnselectedOptionData(copy.getRoot());
  return copy.toJson();
}
