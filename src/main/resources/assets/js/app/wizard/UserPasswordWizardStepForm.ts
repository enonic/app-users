import {OpenChangePasswordDialogEvent} from './OpenChangePasswordDialogEvent';
import {PasswordGenerator} from './PasswordGenerator';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {Validators} from '@enonic/lib-admin-ui/ui/form/Validators';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {Fieldset} from '@enonic/lib-admin-ui/ui/form/Fieldset';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {WizardStepForm} from '@enonic/lib-admin-ui/app/wizard/WizardStepForm';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Form} from '@enonic/lib-admin-ui/ui/form/Form';
import {FormView} from '@enonic/lib-admin-ui/form/FormView';
import {ValidityChangedEvent} from '@enonic/lib-admin-ui/ValidityChangedEvent';
import {WizardStepValidityChangedEvent} from '@enonic/lib-admin-ui/app/wizard/WizardStepValidityChangedEvent';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';

export class UserPasswordWizardStepForm
    extends UserItemWizardStepForm {

    private password: PasswordGenerator;

    private changePasswordButton: Button;

    private createPasswordFormItem: FormItem;

    private updatePasswordFormItem: FormItem;

    private principal: Principal;

    constructor() {
        super('user-password-wizard-step-form');
    }

    protected initElements(): void {
        super.initElements();

        this.password = new PasswordGenerator();
        this.changePasswordButton = new Button(i18n('action.changePassword'));
    }

    protected postInitElements(): void {
        super.postInitElements();

        this.updatePasswordFormItem.setVisible(false);
    }

    protected createFormItems(): FormItem[] {
        this.createPasswordFormItem = new FormItemBuilder(this.password)
            .setLabel(i18n('field.password')).setValidator(Validators.required).build();

        this.updatePasswordFormItem = new FormItemBuilder(this.changePasswordButton).build();
        return [this.createPasswordFormItem, this.updatePasswordFormItem];
    }

    protected initListeners(): void {
        super.initListeners();

        this.form.onValidityChanged((event: ValidityChangedEvent) => {
            this.createPasswordFormItem.toggleClass(FormItem.INVALID_CLASS, !event.isValid());
            this.updatePasswordFormItem.toggleClass(FormItem.INVALID_CLASS, !event.isValid());
        });

        this.changePasswordButton.onClicked(() => {
            new OpenChangePasswordDialogEvent(this.principal).fire();
        });
    }

    layout(principal: Principal): void {
        this.updatePrincipal(principal);
    }

    updatePrincipal(principal: Principal): void {
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

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.changePasswordButton.addClass('change-password-button');

            return rendered;
        });
    }
}
