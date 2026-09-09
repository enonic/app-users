import type { ComponentType } from 'preact';

import type { IdProviderEditorStep } from '../../model/idprovider-editor-steps';
import { IdProviderEditorDialogIdentityStep } from './IdProviderEditorDialogIdentityStep';

// TODO: [#2666] Permissions and Summary land one phase each.
const NotYet: ComponentType = () => null;

export const ID_PROVIDER_EDITOR_STEP_PANELS: Record<IdProviderEditorStep, ComponentType> = {
  identity: IdProviderEditorDialogIdentityStep,
  permissions: NotYet,
  summary: NotYet,
};
