import Principal = api.security.Principal;
import EmailInput = api.ui.text.EmailInput;
import FormItemBuilder = api.ui.form.FormItemBuilder;
import Validators = api.ui.form.Validators;
import i18n = api.util.i18n;
import IdProviderKey = api.security.IdProviderKey;
import {User} from '../principal/User';

export class UserEmailWizardStepForm
    extends api.app.wizard.WizardStepForm {

    private email: EmailInput;

    private userStoreKey: IdProviderKey;

    private isSystemUser: boolean;

    constructor(userStoreKey: IdProviderKey, isSystemUser: boolean) {
        super();

        this.userStoreKey = userStoreKey;
        this.email = new EmailInput();
        this.email.setIdProviderKey(this.userStoreKey);
        this.isSystemUser = isSystemUser;

        let emailFormItem = new FormItemBuilder(this.email).setLabel(i18n('field.email')).setValidator(Validators.required).build();

        let fieldSet = new api.ui.form.Fieldset();
        fieldSet.add(emailFormItem);

        let form = new api.ui.form.Form(api.form.FormView.VALIDATION_CLASS).add(fieldSet);

        form.onFocus((event) => {
            this.notifyFocused(event);
        });
        form.onBlur((event) => {
            this.notifyBlurred(event);
        });

        form.onValidityChanged((event: api.ValidityChangedEvent) => {
            this.notifyValidityChanged(new api.app.wizard.WizardStepValidityChangedEvent(event.isValid()));
            emailFormItem.toggleClass(api.ui.form.FormItem.INVALID_CLASS, !event.isValid());
        });

        this.appendChild(form);
    }

    layout(principal: Principal) {
        let user = (<User>principal);
        if (user) {
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
