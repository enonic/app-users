import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {PrincipalLoader} from 'lib-admin-ui/security/PrincipalLoader';
import {PrincipalComboBox} from 'lib-admin-ui/ui/security/PrincipalComboBox';
import {WizardStepForm} from 'lib-admin-ui/app/wizard/WizardStepForm';
import {FormItemBuilder} from 'lib-admin-ui/ui/form/FormItem';
import {Fieldset} from 'lib-admin-ui/ui/form/Fieldset';
import {Form} from 'lib-admin-ui/ui/form/Form';
import {i18n} from 'lib-admin-ui/util/Messages';

export class PrincipalMembersWizardStepForm
    extends WizardStepForm {

    private principals: PrincipalComboBox;

    private principal: Principal;

    private loader: PrincipalLoader;

    constructor() {
        super();

        this.loader =
            new PrincipalLoader().setAllowedTypes([PrincipalType.GROUP, PrincipalType.USER]).skipPrincipals([PrincipalKey.ofAnonymous()]);

        this.principals = <PrincipalComboBox>PrincipalComboBox.create().setLoader(this.loader).build();

        let principalsFormItem = new FormItemBuilder(this.principals).setLabel(i18n('field.members')).build();

        let fieldSet = new Fieldset();
        fieldSet.add(principalsFormItem);

        let form = new Form().add(fieldSet);

        form.onFocus((event) => {
            this.notifyFocused(event);
        });
        form.onBlur((event) => {
            this.notifyBlurred(event);
        });

        this.appendChild(form);

    }

    layout(principal: Principal) {
        this.principal = principal;
        this.loader.skipPrincipal(principal.getKey());
        this.selectMembers();
    }

    private selectMembers(): void {

        if (!!this.principal) {
            let value = this.getPrincipalMembers().map((key: PrincipalKey) => {
                return key.toString();
            }).join(';');

            this.principals.setValue(value);
        }
    }

    getMembers(): Principal[] {
        return this.principals.getSelectedDisplayValues();
    }

    getPrincipals(): PrincipalComboBox {
        return this.principals;
    }

    getPrincipal(): Principal {
        return this.principal;
    }

    getPrincipalMembers(): PrincipalKey[] {
        throw new Error('Must be implemented by inheritors');
    }

    giveFocus(): boolean {
        return this.principals.giveFocus();
    }

    getLoader(): PrincipalLoader {
        return this.loader;
    }
}
