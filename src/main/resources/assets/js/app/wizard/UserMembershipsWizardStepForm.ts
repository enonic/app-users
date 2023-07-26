import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {RoleKeys} from '@enonic/lib-admin-ui/security/RoleKeys';
import {PrincipalComboBox} from '@enonic/lib-admin-ui/ui/security/PrincipalComboBox';
import {User} from '../principal/User';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {PrincipalLoader} from '../principal/PrincipalLoader';

export class UserMembershipsWizardStepForm
    extends UserItemWizardStepForm {

    private groups: PrincipalComboBox;

    private roles: PrincipalComboBox;

    constructor() {
        super('user-memberships-wizard-step-form');
    }

    protected initElements(): void {
        super.initElements();

        const groupsLoader = new PrincipalLoader()
            .setAllowedTypes([PrincipalType.GROUP]);
        this.groups = (PrincipalComboBox.create().setLoader(groupsLoader).build()) as PrincipalComboBox;

        const rolesLoader = new PrincipalLoader()
            .setAllowedTypes([PrincipalType.ROLE])
            .skipPrincipals([RoleKeys.EVERYONE, RoleKeys.AUTHENTICATED]);
        this.roles = PrincipalComboBox.create().setLoader(rolesLoader).build() as PrincipalComboBox;
    }

    protected createFormItems(): FormItem[] {
        const groupsFormItem: FormItem = new FormItemBuilder(this.groups).setLabel(i18n('field.groups')).build();
        const rolesFormItem: FormItem = new FormItemBuilder(this.roles).setLabel(i18n('field.roles')).build();

        return [rolesFormItem, groupsFormItem];
    }

    layout(principal: Principal): void {
        const rolesKeys: PrincipalKey[] = this.getRolesKeysFromUser(principal as User);

        if (this.roles.isDirty()) {
            if (ObjectHelper.arrayEquals(this.getRolesKeys(), rolesKeys)) {
                this.roles.resetBaseValues();
            }
        } else {
            this.roles.setValue(rolesKeys.join(';'));
        }

        const groupKeys: PrincipalKey[] = this.getGroupsKeysFromUser(principal as User);

        if (this.groups.isDirty()) {
            if (ObjectHelper.arrayEquals(this.getGroupsKeys(), groupKeys)) {
                this.groups.resetBaseValues();
            }
        } else {
            this.groups.setValue(groupKeys.join(';'));
        }
    }

    getRoles(): Principal[] {
        return this.roles.getSelectedDisplayValues();
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
        return this.groups.getSelectedDisplayValues();
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
