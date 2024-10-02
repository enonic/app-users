import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {RoleKeys} from '@enonic/lib-admin-ui/security/RoleKeys';
import {User} from '../principal/User';
import {Group} from '../principal/Group';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {PrincipalComboBox, PrincipalComboBoxWrapper} from '@enonic/lib-admin-ui/ui/security/PrincipalComboBox';
import {UsersPrincipalCombobox} from './UsersPrincipalComboBox';

export class RolesWizardStepForm
    extends UserItemWizardStepForm {

    private roles: PrincipalComboBox;

    private rolesWrapper: PrincipalComboBoxWrapper;

    constructor() {
        super('roles-wizard-step-form');
    }

    protected initElements(): void {
        super.initElements();

        this.roles = new UsersPrincipalCombobox({
            maxSelected: 0,
            allowedTypes: [PrincipalType.ROLE],
            skipPrincipals: [RoleKeys.EVERYONE, RoleKeys.AUTHENTICATED],
        });

        this.rolesWrapper = new PrincipalComboBoxWrapper(this.roles);
    }

    protected createFormItems(): FormItem[] {
        const formItem: FormItem = new FormItemBuilder(this.rolesWrapper).setLabel(i18n('field.roles')).build();
        return [formItem];
    }

    layout(principal: Principal): void {
        const roles: Principal[] = this.getRolesKeysFromPrincipal(principal);
        const rolesKeys: PrincipalKey[] = roles.map((role: Principal) => role.getKey());

        if (this.rolesWrapper.isDirty()) {
            if (ObjectHelper.arrayEquals(this.getRolesKeys(), rolesKeys)) {
                this.rolesWrapper.resetBaseValues();
            }
        } else {
            this.roles.deselectAll(true);
            this.roles.select(roles);
        }
    }

    getRoles(): Principal[] {
        return this.roles.getSelectedOptions().map((option) => option.getOption().getDisplayValue());
    }

    getRolesKeys(): PrincipalKey[] {
        return this.getRoles().map((role: Principal) => role.getKey());
    }

    private getRolesKeysFromPrincipal(principal: Principal): Principal[] {
        if (principal && principal.isUser()) {
            return (principal as User).getMemberships()
                .filter((membership: Principal) => membership.isRole());
        }

        if (principal && principal.isGroup()) {
            return (principal as Group).getMemberships().filter((m: Principal) => m.isRole());
        }

        return [];
    }

}
