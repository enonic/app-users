import type { ComponentType } from 'preact';

import type { IdProviderEditorStep } from '../../model/idprovider-editor-steps';
import { IdProviderEditorDialogIdentityStep } from './IdProviderEditorDialogIdentityStep';
import { IdProviderEditorDialogPermissionsStep } from './IdProviderEditorDialogPermissionsStep';

// TODO: [#2666] Summary lands in the next phase.
const NotYet: ComponentType = () => null;

export const ID_PROVIDER_EDITOR_STEP_PANELS: Record<IdProviderEditorStep, ComponentType> = {
  identity: IdProviderEditorDialogIdentityStep,
  permissions: IdProviderEditorDialogPermissionsStep,
  summary: NotYet,
};
