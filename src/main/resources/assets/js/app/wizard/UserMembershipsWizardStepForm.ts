import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {RoleKeys} from '@enonic/lib-admin-ui/security/RoleKeys';
import {PrincipalComboBox, PrincipalComboBoxWrapper} from '@enonic/lib-admin-ui/ui/security/PrincipalComboBox';
import {User} from '../principal/User';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {UsersPrincipalCombobox} from './UsersPrincipalComboBox';

export class UserMembershipsWizardStepForm
    extends UserItemWizardStepForm {

    private groups: PrincipalComboBox;

    private groupsWrapper: PrincipalComboBoxWrapper;

    private roles: PrincipalComboBox;

    private rolesWrapper: PrincipalComboBoxWrapper;

    constructor() {
        super('user-memberships-wizard-step-form');
    }

    protected initElements(): void {
        super.initElements();

        this.groups = new UsersPrincipalCombobox({
            maxSelected: 0,
            allowedTypes: [PrincipalType.GROUP],
            skipPrincipals: [RoleKeys.EVERYONE, RoleKeys.AUTHENTICATED],
        });

        this.groupsWrapper = new PrincipalComboBoxWrapper(this.groups);

        this.roles = new UsersPrincipalCombobox({
            maxSelected: 0,
            allowedTypes: [PrincipalType.ROLE],
            skipPrincipals: [RoleKeys.EVERYONE, RoleKeys.AUTHENTICATED],
        });

        this.rolesWrapper = new PrincipalComboBoxWrapper(this.roles);
    }

    protected createFormItems(): FormItem[] {
        const groupsFormItem: FormItem = new FormItemBuilder(this.groupsWrapper).setLabel(i18n('field.groups')).build();
        const rolesFormItem: FormItem = new FormItemBuilder(this.rolesWrapper).setLabel(i18n('field.roles')).build();

        return [rolesFormItem, groupsFormItem];
    }

    layout(principal: Principal): void {
        const rolesKeys: PrincipalKey[] = this.getRolesKeysFromUser(<User>principal);

        if (this.rolesWrapper.isDirty()) {
            if (ObjectHelper.arrayEquals(this.getRolesKeys(), rolesKeys)) {
                this.rolesWrapper.resetBaseValues();
            }
        } else {
            this.rolesWrapper.setValue(rolesKeys.join(';'));
        }

        const groupKeys: PrincipalKey[] = this.getGroupsKeysFromUser(<User>principal);

        if (this.groupsWrapper.isDirty()) {
            if (ObjectHelper.arrayEquals(this.getGroupsKeys(), groupKeys)) {
                this.groupsWrapper.resetBaseValues();
            }
        } else {
            this.groupsWrapper.setValue(groupKeys.join(';'));
        }
    }

    getRoles(): Principal[] {
        return this.roles.getSelectedOptions().map((option) => option.getOption().getDisplayValue());
    }

    getRolesKeys(): PrincipalKey[] {
        return this.getRoles().map((role: Principal) => role.getKey());
    }

    private getRolesFromUser(user: User): Principal[] {
        return user.getMemberships().filter((membership: Principal) => membership.isRole());
    }

    private getRolesKeysFromUser(user: User): PrincipalKey[] {
        return this.getRolesFromUser(user).map((role: Principal) => role.getKey());
    }

    private getGroupsFromUser(user: User): Principal[] {
        return user.getMemberships().filter((membership: Principal) => membership.isGroup());
    }

    private getGroupsKeysFromUser(user: User): PrincipalKey[] {
        return this.getGroupsFromUser(user).map((group: Principal) => group.getKey());
    }

    getGroups(): Principal[] {
        return this.groups.getSelectedOptions().map((option) => option.getOption().getDisplayValue());
    }

    getGroupsKeys(): PrincipalKey[] {
        return this.getGroups().map((role: Principal) => role.getKey());
    }

    getMemberships(): Principal[] {
        return [...this.getGroups(), ...this.getRoles()];
    }

    getMembershipsKeys(): PrincipalKey[] {
        return this.getMemberships().map((principal: Principal) => principal.getKey());
    }

    giveFocus(): boolean {
        return this.groups.giveFocus();
    }
}
