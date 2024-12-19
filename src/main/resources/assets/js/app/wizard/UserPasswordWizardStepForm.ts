import {OpenChangePasswordDialogEvent} from './OpenChangePasswordDialogEvent';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ValidityChangedEvent} from '@enonic/lib-admin-ui/ValidityChangedEvent';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {NewPublicKeyDialog} from './NewPublicKeyDialog';
import {User} from '../principal/User';
import {PublicKeysGrid} from '../view/PublicKeysGrid';
import {SetUserPasswordEvent} from './SetUserPasswordEvent';
import {PasswordGenerator} from './PasswordGenerator';

export class UserPasswordWizardStepForm
    extends UserItemWizardStepForm {

    private password: string;

    private changePasswordButton: Button;

    private addPublicKeyButton: Button;

    private updatePasswordFormItem: FormItem;

    private addPublicKeyFormItem: FormItem;

    private principal: Principal;

    private publicKeysGrid: PublicKeysGrid;

    constructor(principal?: Principal) {
        super('user-password-wizard-step-form');

        this.principal = principal;
    }

    protected initElements(): void {
        super.initElements();

        this.changePasswordButton = new Button(i18n(!this.principal ? 'action.setPassword' : 'action.changePassword'));
        this.addPublicKeyButton = new Button(i18n('action.add'));
        this.publicKeysGrid = new PublicKeysGrid();
    }

    protected postInitElements(): void {
        super.postInitElements();

        this.addPublicKeyFormItem.setVisible(false);
    }

    protected createFormItems(): FormItem[] {
        this.updatePasswordFormItem = new FormItemBuilder(this.changePasswordButton).build();

        this.addPublicKeyFormItem = new FormItemBuilder(this.addPublicKeyButton).setLabel(i18n('field.userKeys.grid.title')).build();

        return [this.updatePasswordFormItem, this.addPublicKeyFormItem];
    }

    protected initListeners(): void {
        super.initListeners();

        this.form.onValidityChanged((event: ValidityChangedEvent) => {
            this.updatePasswordFormItem.toggleClass(FormItem.INVALID_CLASS, !event.isValid());
            this.addPublicKeyFormItem.toggleClass(FormItem.INVALID_CLASS, !event.isValid());
        });

        this.changePasswordButton.onClicked(() => {
            new OpenChangePasswordDialogEvent(this.principal).fire();
        });

        this.addPublicKeyButton.onClicked(() => {
            const user = this.principal as User;
            const publicKeysDialog = new NewPublicKeyDialog(user);
            publicKeysDialog.open();
        });

        SetUserPasswordEvent.on((event) => {
           this.password = event.getPassword();
        });
    }

    layout(principal: Principal): void {
        this.updatePrincipal(principal);
    }

    updatePrincipal(principal: Principal): void {
        this.principal = principal;

        if (principal && principal.getKey().getIdProvider().isSystem()) {
            this.addPublicKeyFormItem.setVisible(true);
            this.publicKeysGrid.setUser(principal as User);
        }
    }

    getPassword(): string {
        return this.password;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.changePasswordButton.addClass('change-password-button');

            this.publicKeysGrid.insertBeforeEl(this.addPublicKeyButton);

            const principal = this.principal as User;
            if (principal?.getKey().getIdProvider().isSystem()) {
                this.publicKeysGrid.setUser(principal);
            }

            return rendered;
        });
    }
}
