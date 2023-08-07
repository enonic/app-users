import {OpenChangePasswordDialogEvent} from './OpenChangePasswordDialogEvent';
import {PasswordGenerator} from './PasswordGenerator';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {Validators} from '@enonic/lib-admin-ui/ui/form/Validators';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ValidityChangedEvent} from '@enonic/lib-admin-ui/ValidityChangedEvent';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {NewPublicKeyDialog} from './NewPublicKeyDialog';
import {User} from '../principal/User';
import {PublicKeysGrid} from '../view/PublicKeysGrid';

export class UserPasswordWizardStepForm
    extends UserItemWizardStepForm {

    private password: PasswordGenerator;

    private changePasswordButton: Button;

    private addPublicKeyButton: Button;

    private createPasswordFormItem: FormItem;

    private updatePasswordFormItem: FormItem;

    private addPublicKeyFormItem: FormItem;

    private principal: Principal;

    private publicKeysGrid: PublicKeysGrid;

    constructor() {
        super('user-password-wizard-step-form');
    }

    protected initElements(): void {
        super.initElements();

        this.password = new PasswordGenerator();
        this.changePasswordButton = new Button(i18n('action.changePassword'));
        this.addPublicKeyButton = new Button(i18n('action.addPublicKey'));
        this.publicKeysGrid = new PublicKeysGrid();
    }

    protected postInitElements(): void {
        super.postInitElements();

        this.updatePasswordFormItem.setVisible(false);
        this.addPublicKeyFormItem.setVisible(false);
    }

    protected createFormItems(): FormItem[] {
        this.createPasswordFormItem = new FormItemBuilder(this.password)
            .setLabel(i18n('field.password')).setValidator(Validators.required).build();

        this.updatePasswordFormItem = new FormItemBuilder(this.changePasswordButton).build();

        this.addPublicKeyFormItem = new FormItemBuilder(this.addPublicKeyButton).setLabel(i18n('field.userKeys.grid.title')).build();

        return [this.createPasswordFormItem, this.updatePasswordFormItem, this.addPublicKeyFormItem];
    }

    protected initListeners(): void {
        super.initListeners();

        this.form.onValidityChanged((event: ValidityChangedEvent) => {
            this.createPasswordFormItem.toggleClass(FormItem.INVALID_CLASS, !event.isValid());
            this.updatePasswordFormItem.toggleClass(FormItem.INVALID_CLASS, !event.isValid());
            this.addPublicKeyFormItem.toggleClass(FormItem.INVALID_CLASS, !event.isValid());
        });

        this.changePasswordButton.onClicked(() => {
            new OpenChangePasswordDialogEvent(this.principal).fire();
        });

        this.addPublicKeyButton.onClicked(() => {
            const user = this.principal as User;
            const publicKeysDialog = new NewPublicKeyDialog(user);
            publicKeysDialog.setCallback((publicKey) => {
                this.publicKeysGrid.addPublicKey(user, publicKey);
            });
            publicKeysDialog.open();
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
            this.addPublicKeyFormItem.setVisible(true);
            this.publicKeysGrid.setUser(principal as User);
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

            this.publicKeysGrid.insertBeforeEl(this.addPublicKeyButton);

            const principal = this.principal as User;
            if (principal) {
                if (principal.getKey().getIdProvider().isSystem()) {
                    this.addPublicKeyButton.show();
                    this.publicKeysGrid.show();
                    this.publicKeysGrid.setUser(principal);
                } else {
                    this.addPublicKeyButton.hide();
                    this.publicKeysGrid.hide();
                }
            }
            return rendered;
        });
    }
}
