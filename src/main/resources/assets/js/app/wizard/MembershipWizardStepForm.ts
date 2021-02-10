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

export class MembershipWizardStepForm
    extends WizardStepForm {

    private principals: PrincipalComboBox;

    private loader: PrincipalLoader;

    private form: Form;

    constructor() {
        super();

        this.initElements();
        this.initListeners();
    }

    private initElements() {
        this.loader =
            new PrincipalLoader().setAllowedTypes([PrincipalType.GROUP, PrincipalType.USER]).skipPrincipals([PrincipalKey.ofAnonymous()]);

        this.principals = <PrincipalComboBox>PrincipalComboBox.create().setLoader(this.loader).build();

        const principalsFormItem: FormItem = new FormItemBuilder(this.principals).setLabel(i18n('field.members')).build();
        const fieldSet: Fieldset = new Fieldset();
        fieldSet.add(principalsFormItem);

        this.form = new Form().add(fieldSet);
    }

    private initListeners() {
        this.form.onFocus((event) => {
            this.notifyFocused(event);
        });

        this.form.onBlur((event) => {
            this.notifyBlurred(event);
        });
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
