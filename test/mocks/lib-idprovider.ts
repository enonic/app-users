import { vi } from 'vitest';

// ? Shape restated rather than imported from src/main/resources/lib/idprovider.ts — that module reads
// ? the `__` bridge, which only the server tsconfig declares.
type IdProviderDescriptor = {
  mode?: string;
  hasConfig: boolean;
};

type IdProviderPermission = {
  principal: { key: string; type: string; displayName: string };
  access?: string;
};

type IdProviderPermissionInput = {
  principal: string;
  access: string;
};

type IdProviderConfigProperty = {
  name: string;
  type: string;
  values: { v?: unknown; set?: IdProviderConfigProperty[] }[];
};

type IdProviderConfig = {
  applicationKey: string;
  config: IdProviderConfigProperty[];
};

type IdProvider = {
  key: string;
  displayName: string;
  description?: string;
  idProviderConfig?: IdProviderConfig;
};

type DeleteIdProviderResult = {
  key: string;
  deleted: boolean;
  reason?: string;
};

export const getIdProviderDescriptor =
  vi.fn<(params: { application: string }) => IdProviderDescriptor | null>();

export const getIdProviderPermissions =
  vi.fn<(params: { idProvider: string }) => IdProviderPermission[] | null>();

export const defaultIdProviderPermissions = vi.fn<() => IdProviderPermission[]>();

export const getIdProvider = vi.fn<(params: { idProvider: string }) => IdProvider | null>();

export const createIdProvider =
  vi.fn<
    (params: {
      key: string;
      displayName: string;
      description?: string;
      idProviderConfig?: IdProviderConfig;
      permissions?: IdProviderPermissionInput[];
    }) => IdProvider | null
  >();

export const updateIdProvider =
  vi.fn<
    (params: {
      idProvider: string;
      displayName: string;
      description?: string;
      idProviderConfig: IdProviderConfig | null;
      permissions?: IdProviderPermissionInput[];
    }) => IdProvider | null
  >();

export const deleteIdProviders =
  vi.fn<(params: { idProviders: string[] }) => DeleteIdProviderResult[]>();
