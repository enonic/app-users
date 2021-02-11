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
import {Membership} from '../principal/Membership';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {FormItem} from 'lib-admin-ui/ui/form/FormItem';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';

export class MembershipWizardStepForm
    extends UserItemWizardStepForm {

    private principals: PrincipalComboBox;

    private loader: PrincipalLoader;

    constructor() {
        super('membership-wizard-step-form');
    }

    protected initElements() {
        super.initElements();

        this.loader =
            new PrincipalLoader().setAllowedTypes([PrincipalType.GROUP, PrincipalType.USER]).skipPrincipals([PrincipalKey.ofAnonymous()]);
        this.principals = <PrincipalComboBox>PrincipalComboBox.create().setLoader(this.loader).build();
    }

    protected createFormItems(): FormItem[] {
        const principalsFormItem: FormItem = new FormItemBuilder(this.principals).setLabel(i18n('field.members')).build();
        return [principalsFormItem];
    }

    layout(principal: Membership) {
        if (this.principals.isDirty()) {
            if (ObjectHelper.arrayEquals(this.getMembersKeys(), principal.getMembers())) {
                this.principals.resetBaseValues();
            }
        } else {
            this.loader.skipPrincipal(principal.getKey());
            const value: string = principal.getMembers().map((key: PrincipalKey) => key.toString()).join(';');
            this.principals.setValue(value);
        }
    }

    getMembers(): Principal[] {
        return this.principals.getSelectedDisplayValues();
    }

    getMembersKeys(): PrincipalKey[] {
        return this.getMembers().map((principal: Principal) => principal.getKey());
    }

    giveFocus(): boolean {
        return this.principals.giveFocus();
    }

    getLoader(): PrincipalLoader {
        return this.loader;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.form);

            return rendered;
        });
    }
}
