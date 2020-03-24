import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {FilterablePrincipalLoader} from 'lib-admin-ui/security/FilterablePrincipalLoader';
import {RoleKeys} from 'lib-admin-ui/security/RoleKeys';
import {PrincipalComboBox} from 'lib-admin-ui/ui/security/PrincipalComboBox';
import {Fieldset} from 'lib-admin-ui/ui/form/Fieldset';
import {User} from '../principal/User';
import {Group} from '../principal/Group';
import {WizardStepForm} from 'lib-admin-ui/app/wizard/WizardStepForm';
import {Form} from 'lib-admin-ui/ui/form/Form';
import {FormItem, FormItemBuilder} from 'lib-admin-ui/ui/form/FormItem';
import {i18n} from 'lib-admin-ui/util/Messages';

export enum MembershipsType {
    GROUPS,
    ROLES,
    ALL
}

export class MembershipsWizardStepForm
    extends WizardStepForm {

    private groups: PrincipalComboBox;

    private roles: PrincipalComboBox;

    private principal: Principal;

    private rolesLoaded: boolean;

    private type: MembershipsType;

    constructor(type: MembershipsType) {
        super('user-memberships');

        this.type = type;

        const fieldSet = new Fieldset();

        if (type !== MembershipsType.GROUPS) {
            this.initRoles(fieldSet);
        }
        if (type !== MembershipsType.ROLES) {
            this.initGroups(fieldSet);
        }

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
        const groupsLoader: FilterablePrincipalLoader =
            <FilterablePrincipalLoader>new FilterablePrincipalLoader().setAllowedTypes([PrincipalType.GROUP]);

        this.groups = <PrincipalComboBox>PrincipalComboBox.create().setLoader(groupsLoader).build();

        const formItem: FormItem = new FormItemBuilder(this.groups).setLabel(i18n('field.groups')).build();

        fieldSet.add(formItem);
    }

    private initRoles(fieldSet: Fieldset) {
        this.rolesLoaded = false;

        const rolesLoader: FilterablePrincipalLoader = <FilterablePrincipalLoader>new FilterablePrincipalLoader()
            .setAllowedTypes([PrincipalType.ROLE])
            .skipPrincipals([RoleKeys.EVERYONE, RoleKeys.AUTHENTICATED]);

        this.roles = <PrincipalComboBox>PrincipalComboBox.create().setLoader(rolesLoader).build();

        const formItem: FormItem = new FormItemBuilder(this.roles).setLabel(i18n('field.roles')).build();

        fieldSet.add(formItem);
    }

    layout(principal: Principal) {
        this.principal = principal;
        this.selectMembership();
    }

    private selectMembership(): void {
        const isGroupsReady = this.type !== MembershipsType.ROLES; //&& this.groupsLoaded;
        const isRolesReady = this.type !== MembershipsType.GROUPS; //&& this.rolesLoaded;

        if (this.principal && isGroupsReady) {

            const groups = this.getMembershipsFromPrincipal().filter(el => el.isGroup()).map(el => el.getKey().toString());

            this.groups.setValue(groups.join(';'));
        }

        if (this.principal && isRolesReady) {

            const roles = this.getMembershipsFromPrincipal().filter(el => el.isRole()).map(el => el.getKey().toString());

            this.roles.setValue(roles.join(';'));
        }
    }

    getMembershipsFromPrincipal(): Principal[] {
        if (this.principal && this.principal.isUser()) {
            return (<User>this.principal).getMemberships();
        } else if (this.principal && this.principal.isGroup()) {
            return (<Group>this.principal).getMemberships();
        } else {
            return [];
        }
    }

    getMemberships(): Principal[] {
        const groups = this.type !== MembershipsType.ROLES ? this.groups.getSelectedDisplayValues() : [];
        const roles = this.type !== MembershipsType.GROUPS ? this.roles.getSelectedDisplayValues() : [];

        return [...groups, ...roles].map(Principal.fromPrincipal);
    }

    giveFocus(): boolean {
        return this.groups.giveFocus();
    }
}
