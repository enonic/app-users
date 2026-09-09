import type { ComponentType } from 'preact';

import type { IdProviderEditorStep } from '../../model/idprovider-editor-steps';
import { IdProviderEditorDialogIdentityStep } from './IdProviderEditorDialogIdentityStep';
import { IdProviderEditorDialogPermissionsStep } from './IdProviderEditorDialogPermissionsStep';
import { IdProviderEditorDialogSummaryStep } from './IdProviderEditorDialogSummaryStep';

export const ID_PROVIDER_EDITOR_STEP_PANELS: Record<IdProviderEditorStep, ComponentType> = {
  identity: IdProviderEditorDialogIdentityStep,
  permissions: IdProviderEditorDialogPermissionsStep,
  summary: IdProviderEditorDialogSummaryStep,
};
