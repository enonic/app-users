import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {RoleKeys} from '@enonic/lib-admin-ui/security/RoleKeys';
import {PrincipalComboBox} from '@enonic/lib-admin-ui/ui/security/PrincipalComboBox';
import {User} from '../principal/User';
import {Group} from '../principal/Group';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {PrincipalLoader as BasePrincipalLoader} from '@enonic/lib-admin-ui/security/PrincipalLoader';
import {PrincipalLoader} from '../principal/PrincipalLoader';

export class RolesWizardStepForm
    extends UserItemWizardStepForm {

    private roles: PrincipalComboBox;

    constructor() {
        super('roles-wizard-step-form');
    }

    protected initElements(): void {
        super.initElements();

        const rolesLoader: BasePrincipalLoader = new PrincipalLoader()
            .setAllowedTypes([PrincipalType.ROLE])
            .skipPrincipals([RoleKeys.EVERYONE, RoleKeys.AUTHENTICATED]);
        this.roles = (PrincipalComboBox.create().setLoader(rolesLoader).build()) as PrincipalComboBox;
    }

    protected createFormItems(): FormItem[] {
        const formItem: FormItem = new FormItemBuilder(this.roles).setLabel(i18n('field.roles')).build();
        return [formItem];
    }

    layout(principal: Principal): void {
        const rolesKeys: PrincipalKey[] = this.getRolesKeysFromPrincipal(principal);

        if (this.roles.isDirty()) {
            if (ObjectHelper.arrayEquals(this.getRolesKeys(), rolesKeys)) {
                this.roles.resetBaseValues();
            }
        } else {
            this.roles.setValue(rolesKeys.join(';'));
        }
    }

    getRoles(): Principal[] {
        return this.roles.getSelectedDisplayValues();
    }

    getRolesKeys(): PrincipalKey[] {
        return this.getRoles().map((role: Principal) => role.getKey());
    }

    private getRolesKeysFromPrincipal(principal: Principal): PrincipalKey[] {
        if (principal && principal.isUser()) {
            return (principal as User).getMemberships()
                .filter((membership: Principal) => membership.isRole())
                .map((p: Principal) => p.getKey());
        }

        if (principal && principal.isGroup()) {
            return (principal as Group).getMemberships().filter((m: Principal) => m.isRole()).map((p: Principal) => p.getKey());
        }

        return [];
    }

}
