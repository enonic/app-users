import {OpenChangePasswordDialogEvent} from './OpenChangePasswordDialogEvent';
import {PasswordGenerator} from './PasswordGenerator';
import {Principal} from 'lib-admin-ui/security/Principal';
import {Validators} from 'lib-admin-ui/ui/form/Validators';
import {FormItem, FormItemBuilder} from 'lib-admin-ui/ui/form/FormItem';
import {Fieldset} from 'lib-admin-ui/ui/form/Fieldset';
import {Button} from 'lib-admin-ui/ui/button/Button';
import {WizardStepForm} from 'lib-admin-ui/app/wizard/WizardStepForm';
import {i18n} from 'lib-admin-ui/util/Messages';
import {Form} from 'lib-admin-ui/ui/form/Form';
import {FormView} from 'lib-admin-ui/form/FormView';
import {ValidityChangedEvent} from 'lib-admin-ui/ValidityChangedEvent';
import {WizardStepValidityChangedEvent} from 'lib-admin-ui/app/wizard/WizardStepValidityChangedEvent';

export class UserPasswordWizardStepForm
    extends WizardStepForm {

    private password: PasswordGenerator;

    private changePasswordButton: Button;

    private createPasswordFormItem: FormItem;

    private updatePasswordFormItem: FormItem;

    private principal: Principal;

    private fieldSet: Fieldset;

    constructor() {
        super();

        this.password = new PasswordGenerator();

        this.changePasswordButton = new Button(i18n('action.changePassword'));
        this.changePasswordButton.addClass('change-password-button');

        this.createPasswordFormItem = new FormItemBuilder(this.password)
            .setLabel(i18n('field.password')).setValidator(Validators.required).build();

        this.updatePasswordFormItem = new FormItemBuilder(this.changePasswordButton)
            .setLabel(i18n('field.password')).build();

        this.fieldSet = new Fieldset();
        this.fieldSet.add(this.createPasswordFormItem);
        this.fieldSet.add(this.updatePasswordFormItem);

        let passwordForm = new Form(FormView.VALIDATION_CLASS).add(this.fieldSet);

        passwordForm.onValidityChanged((event: ValidityChangedEvent) => {
            this.notifyValidityChanged(new WizardStepValidityChangedEvent(event.isValid()));
            this.createPasswordFormItem.toggleClass(FormItem.INVALID_CLASS, !event.isValid());
            this.updatePasswordFormItem.toggleClass(FormItem.INVALID_CLASS, !event.isValid());
        });

        this.changePasswordButton.onClicked(() => {
            new OpenChangePasswordDialogEvent(this.principal).fire();
        });
        this.updatePasswordFormItem.setVisible(false);
        this.appendChild(passwordForm);
    }

    layout(principal: Principal) {
        this.updatePrincipal(principal);
    }

    updatePrincipal(principal: Principal) {
        this.principal = principal;
        if (principal) {
            this.fieldSet.removeItem(this.createPasswordFormItem);
            this.updatePasswordFormItem.setVisible(true);
        }
    }

    isValid(): boolean {
        return !!this.principal || this.password.isValid();
    }

    getPassword(): string {
        return this.password.getValue();
    }

    giveFocus(): boolean {
        return this.password.giveFocus();
    }
}
