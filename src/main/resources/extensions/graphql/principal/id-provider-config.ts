import type { IdProviderConfigProperty, IdProviderConfigValue } from '/lib/idprovider';

// ! The Java side resolves `type` with `ValueTypes.getByName`, which answers null for a name it does not
// ! know and fails the whole write on it. Refused here instead, with the path that carried it.
const VALUE_TYPES: ReadonlySet<string> = new Set([
  'PropertySet',
  'String',
  'Xml',
  'LocalDate',
  'LocalTime',
  'LocalDateTime',
  'DateTime',
  'Long',
  'Boolean',
  'Double',
  'GeoPoint',
  'Reference',
  'BinaryReference',
  'Link',
]);

/**
 * A config tree as the `config` argument carries it, checked into the shape `/lib/idprovider` writes.
 * Throws on anything else, which fails the mutation rather than storing half a tree.
 *
 * Missing `values` reads as none, and a `PropertySet` value without `set` as a null set.
 */
export function parseIdProviderConfig(json: unknown): IdProviderConfigProperty[] {
  return parseTree(json, 'config');
}

function parseTree(json: unknown, path: string): IdProviderConfigProperty[] {
  if (!Array.isArray(json)) {
    throw new Error(`${path} is not a list of properties`);
  }

  return json.map((entry: unknown, index) => parseProperty(entry, `${path}[${index}]`));
}

function parseProperty(json: unknown, path: string): IdProviderConfigProperty {
  if (!isRecord(json) || typeof json.name !== 'string' || json.name.length === 0) {
    throw new Error(`${path} has no name`);
  }

  const { name, type } = json;
  const at = `${path}.${name}`;

  if (typeof type !== 'string' || !VALUE_TYPES.has(type)) {
    throw new Error(`${at} has an unknown type`);
  }

  const values = json.values ?? [];
  if (!Array.isArray(values)) {
    throw new Error(`${at} has no list of values`);
  }

  return {
    name,
    type,
    values: values.map((value: unknown, index) =>
      parseValue(value, type === 'PropertySet', `${at}[${index}]`),
    ),
  };
}

function parseValue(json: unknown, isSet: boolean, path: string): IdProviderConfigValue {
  if (!isRecord(json)) {
    throw new Error(`${path} is not a value`);
  }

  if (isSet) {
    return json.set == null ? {} : { set: parseTree(json.set, path) };
  }

  if (json.v == null) {
    return {};
  }

  if (typeof json.v === 'object') {
    throw new Error(`${path} is not a scalar`);
  }

  return { v: json.v };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
