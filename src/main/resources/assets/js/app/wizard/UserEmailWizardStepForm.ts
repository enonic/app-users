import {Principal} from 'lib-admin-ui/security/Principal';
import {EmailInput} from 'lib-admin-ui/ui/text/EmailInput';
import {Validators} from 'lib-admin-ui/ui/form/Validators';
import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';
import {User} from '../principal/User';
import {WizardStepForm} from 'lib-admin-ui/app/wizard/WizardStepForm';
import {FormItem, FormItemBuilder} from 'lib-admin-ui/ui/form/FormItem';
import {Fieldset} from 'lib-admin-ui/ui/form/Fieldset';
import {Form} from 'lib-admin-ui/ui/form/Form';
import {FormView} from 'lib-admin-ui/form/FormView';
import {ValidityChangedEvent} from 'lib-admin-ui/ValidityChangedEvent';
import {WizardStepValidityChangedEvent} from 'lib-admin-ui/app/wizard/WizardStepValidityChangedEvent';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';

export class UserEmailWizardStepForm
    extends WizardStepForm {

    private email: EmailInput;

    private idProviderKey: IdProviderKey;

    private isSystemUser: boolean;

    constructor(idProviderKey: IdProviderKey, isSystemUser: boolean) {
        super();

        this.idProviderKey = idProviderKey;
        this.email = new EmailInput();
        this.email.setIdProviderKey(this.idProviderKey);
        this.isSystemUser = isSystemUser;

        const emailFormItem: FormItem =
            new FormItemBuilder(this.email).setLabel(i18n('field.email')).setValidator(Validators.required).build();

        const fieldSet: Fieldset = new Fieldset();
        fieldSet.add(emailFormItem);

        const form: Form = new Form(FormView.VALIDATION_CLASS).add(fieldSet);

        form.onFocus((event) => {
            this.notifyFocused(event);
        });

        form.onBlur((event) => {
            this.notifyBlurred(event);
        });

        form.onValidityChanged((event: ValidityChangedEvent) => {
            this.notifyValidityChanged(new WizardStepValidityChangedEvent(event.isValid()));
            emailFormItem.toggleClass(FormItem.INVALID_CLASS, !event.isValid());
        });

        this.appendChild(form);
    }

    layout(principal: Principal) {
        const user: User = (<User>principal);

        if (this.email.isDirty()) {
            if (ObjectHelper.stringEquals(this.email.getValue(), user.getEmail())) {
                this.email.resetBaseValues();
            }
        } else {
            this.email.setValue(user.getEmail());
            this.email.setName(user.getEmail());
            this.email.setOriginEmail(user.getEmail());
        }
    }

    isValid(): boolean {
        return this.isSystemUser || this.email.isValid();
    }

    getEmail(): string {
        return this.email.getValue();
    }

    giveFocus(): boolean {
        return this.email.giveFocus();
    }
}
