import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {PrincipalLoader} from 'lib-admin-ui/security/PrincipalLoader';
import {RoleKeys} from 'lib-admin-ui/security/RoleKeys';
import {PrincipalComboBox} from 'lib-admin-ui/ui/security/PrincipalComboBox';
import {Fieldset} from 'lib-admin-ui/ui/form/Fieldset';
import {User} from '../principal/User';
import {Group} from '../principal/Group';
import {WizardStepForm} from 'lib-admin-ui/app/wizard/WizardStepForm';
import {Form} from 'lib-admin-ui/ui/form/Form';
import {FormItemBuilder} from 'lib-admin-ui/ui/form/FormItem';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';

export class UserMembershipsWizardStepForm
    extends WizardStepForm {

    private groups: PrincipalComboBox;

    private roles: PrincipalComboBox;

    constructor() {
        super('user-memberships');

        const fieldSet = new Fieldset();

        this.initRoles(fieldSet);

        this.initGroups(fieldSet);

        const form = new Form().add(fieldSet);

        this.appendChild(form);

        form.onFocus((event) => {
            this.notifyFocused(event);
        });
        form.onBlur((event) => {
            this.notifyBlurred(event);
        });

        this.appendChild(form);
    }

    private initGroups(fieldSet: Fieldset) {

        const groupsLoader = new PrincipalLoader().setAllowedTypes([PrincipalType.GROUP]);

        this.groups = <PrincipalComboBox>PrincipalComboBox.create().setLoader(groupsLoader).build();

        const formItem = new FormItemBuilder(this.groups).setLabel(i18n('field.groups')).build();

        fieldSet.add(formItem);
    }

    private initRoles(fieldSet: Fieldset) {
        const rolesLoader = new PrincipalLoader().setAllowedTypes([PrincipalType.ROLE]).skipPrincipals([RoleKeys.EVERYONE,
            RoleKeys.AUTHENTICATED]);

        this.roles = <PrincipalComboBox>PrincipalComboBox.create().setLoader(rolesLoader).build();

        const formItem = new FormItemBuilder(this.roles).setLabel(i18n('field.roles')).build();

        fieldSet.add(formItem);
    }

    layout(principal: Principal) {
        const rolesKeys: PrincipalKey[] = this.getRolesKeysFromUser(<User>principal);

        if (this.roles.isDirty()) {
            if (ObjectHelper.arrayEquals(this.getRolesKeys(), rolesKeys)) {
                this.roles.resetBaseValues();
            }
        } else {
            this.roles.setValue(rolesKeys.join(';'));
        }

        const groupKeys: PrincipalKey[] = this.getGroupsKeysFromUser(<User>principal);

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
