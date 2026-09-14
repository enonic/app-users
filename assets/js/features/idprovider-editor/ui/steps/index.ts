import type { ComponentType } from 'preact';

import type { IdProviderEditorStep } from '../../model/idprovider-editor-steps';
import { IdProviderEditorDialogGeneralStep } from './IdProviderEditorDialogGeneralStep';
import { IdProviderEditorDialogPermissionsStep } from './IdProviderEditorDialogPermissionsStep';
import { IdProviderEditorDialogSummaryStep } from './IdProviderEditorDialogSummaryStep';

export const ID_PROVIDER_EDITOR_STEP_PANELS: Record<IdProviderEditorStep, ComponentType> = {
  general: IdProviderEditorDialogGeneralStep,
  permissions: IdProviderEditorDialogPermissionsStep,
  summary: IdProviderEditorDialogSummaryStep,
};
