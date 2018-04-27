import '../../api.ts';
import Principal = api.security.Principal;
import PrincipalType = api.security.PrincipalType;
import PrincipalLoader = api.security.PrincipalLoader;
import RoleKeys = api.security.RoleKeys;
import FormItemBuilder = api.ui.form.FormItemBuilder;
import PrincipalComboBox = api.ui.security.PrincipalComboBox;
import Fieldset = api.ui.form.Fieldset;
import i18n = api.util.i18n;

export enum MembershipsType {
    GROUPS,
    ROLES,
    ALL
}

export class MembershipsWizardStepForm extends api.app.wizard.WizardStepForm {

    private groups: PrincipalComboBox;

    private roles: PrincipalComboBox;

    private principal: Principal;

    private rolesLoaded: boolean;

    private type: MembershipsType;

    constructor(type: MembershipsType) {
        super('user-memberships');

        this.type = type;

        const fieldSet = new api.ui.form.Fieldset();

        if (type !== MembershipsType.GROUPS) {
            this.initRoles(fieldSet);
        }
        if (type !== MembershipsType.ROLES) {
            this.initGroups(fieldSet);
        }

        const form = new api.ui.form.Form().add(fieldSet);

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

        this.groups = PrincipalComboBox.create().setLoader(groupsLoader).build();

        const formItem = new FormItemBuilder(this.groups).setLabel(i18n('field.groups')).build();

        fieldSet.add(formItem);
    }

    private initRoles(fieldSet: Fieldset) {
        this.rolesLoaded = false;

        const rolesLoader = new PrincipalLoader().setAllowedTypes([PrincipalType.ROLE]).skipPrincipals([RoleKeys.EVERYONE,
            RoleKeys.AUTHENTICATED]);

        this.roles = PrincipalComboBox.create().setLoader(rolesLoader).build();

        const formItem = new FormItemBuilder(this.roles).setLabel(i18n('field.roles')).build();

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
            return this.principal.asUser().getMemberships();
        } else if (this.principal && this.principal.isGroup()) {
            return this.principal.asGroup().getMemberships();
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
