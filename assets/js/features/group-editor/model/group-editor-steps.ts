import { defineSteps } from '../../../shared/step-dialog';
import type { GroupFormField } from './group-form';

export type GroupEditorStep = 'idProvider' | 'general' | 'members' | 'roles' | 'summary';

export const GROUP_EDITOR_STEPS = defineSteps<GroupEditorStep, GroupFormField>({
  idProvider: { title: 'groups.dialog.idProvider', fields: ['idProvider'] },
  general: { title: 'groups.dialog.general', fields: ['displayName', 'name'] },
  members: { title: 'groups.dialog.members', fields: [] },
  roles: { title: 'groups.dialog.roles', fields: [] },
  summary: { title: 'groups.dialog.summary', fields: [] },
});
