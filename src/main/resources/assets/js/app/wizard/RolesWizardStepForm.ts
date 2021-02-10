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

export class RolesWizardStepForm
    extends WizardStepForm {

    private roles: PrincipalComboBox;

    constructor() {
        super();

        const fieldSet = new Fieldset();

        this.initRoles(fieldSet);

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

    private initRoles(fieldSet: Fieldset) {
        const rolesLoader = new PrincipalLoader().setAllowedTypes([PrincipalType.ROLE]).skipPrincipals([RoleKeys.EVERYONE,
            RoleKeys.AUTHENTICATED]);

        this.roles = <PrincipalComboBox>PrincipalComboBox.create().setLoader(rolesLoader).build();

        const formItem = new FormItemBuilder(this.roles).setLabel(i18n('field.roles')).build();

        fieldSet.add(formItem);
    }

    layout(principal: Principal) {
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
            return (<User>principal).getMemberships()
                .filter((membership: Principal) => membership.isRole())
                .map((p: Principal) => p.getKey());
        }

        if (principal && principal.isGroup()) {
            return (<Group>principal).getMemberships().map((p: Principal) => p.getKey());
        }

        return [];
    }

}
