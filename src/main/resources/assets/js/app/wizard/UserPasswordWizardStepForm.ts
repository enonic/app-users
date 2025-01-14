import {OpenChangePasswordDialogEvent} from './OpenChangePasswordDialogEvent';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ValidityChangedEvent} from '@enonic/lib-admin-ui/ValidityChangedEvent';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {NewPublicKeyDialog} from './NewPublicKeyDialog';
import {User} from '../principal/User';
import {PublicKeysGrid} from '../view/PublicKeysGrid';
import {UserPasswordWizardStepFormParams} from './UserPasswordWizardStepFormParams';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PasswordGenerator} from './PasswordGenerator';

export class UserPasswordWizardStepForm
    extends UserItemWizardStepForm<Principal> {

    private setOrChangePasswordButton: Button;

    private password: PasswordGenerator;

    private createPasswordFormItem: FormItem;

    private updatePasswordFormItem: FormItem;

    private addPublicKeyFormItem?: FormItem;

    private addPublicKeyButton?: Button;

    private publicKeysGrid?: PublicKeysGrid;

    private user?: User;

    private isSystemUser: boolean;

    private isNewUserOrUserWithoutPassword: boolean;

    private isUserHasPassword: boolean;

    constructor(params: UserPasswordWizardStepFormParams) {
        super(params, 'user-password-wizard-step-form');

        this.params = params;

        // `user` and `isSystemUser` properties are initialized in `initElements()` method,
        // because this method is called in the constructor of super class, and they are used here
    }

    protected getParams(): UserPasswordWizardStepFormParams {
        return super.getParams() as UserPasswordWizardStepFormParams
    }

    protected initElements(): void {
        super.initElements();

        this.user = this.getParams().user;
        this.isSystemUser = this.getParams().idProvider.getKey().isSystem();
        this.isNewUserOrUserWithoutPassword = !this.user || !this.user.hasPassword();
        this.isUserHasPassword = !!this.user && this.user.hasPassword();

        this.password = new PasswordGenerator();
        this.password.setVisible(false);

        this.setOrChangePasswordButton =
            new Button(i18n(this.isNewUserOrUserWithoutPassword ? 'action.setPassword' : 'action.changePassword'));

        if (this.isSystemUser) {
            this.addPublicKeyButton = new Button(i18n('action.add'));
            this.addPublicKeyButton.setEnabled(!!this.user);
            this.publicKeysGrid = new PublicKeysGrid();
        }
    }

    protected createFormItems(): FormItem[] {
        const formItems: FormItem[] = [];

        this.createPasswordFormItem = new FormItemBuilder(this.password).setLabel(i18n('field.password')).build();
        formItems.push(this.createPasswordFormItem);

        this.updatePasswordFormItem = new FormItemBuilder(this.setOrChangePasswordButton).build();
        formItems.push(this.updatePasswordFormItem);

        if (this.isSystemUser) {
            this.addPublicKeyFormItem = new FormItemBuilder(this.addPublicKeyButton).setLabel(i18n('field.userKeys.grid.title')).build();
            formItems.push(this.addPublicKeyFormItem);
        }

        return formItems;
    }

    protected initListeners(): void {
        super.initListeners();

        this.form.onValidityChanged((event: ValidityChangedEvent) => {
            this.updatePasswordFormItem.toggleClass(FormItem.INVALID_CLASS, !event.isValid());
        });

        this.setOrChangePasswordButton.onClicked(() => {
            if (this.isNewUserOrUserWithoutPassword) {
                this.password.setVisible(true);
            } else {
                new OpenChangePasswordDialogEvent(this.user).fire();
            }
        });

        if (this.isSystemUser) {
            this.addPublicKeyButton.onClicked(() => {
                const publicKeysDialog = new NewPublicKeyDialog(this.user);
                publicKeysDialog.open();
            });
        }
    }

    layout(user: User): void {
        this.updatePrincipal(user);
    }

    updatePrincipal(principal: User): void {
        this.user = principal;

        if (this.isSystemUser) {
            this.publicKeysGrid.setUser(this.user);
        }
    }

    // isValid(): boolean {
    //     return !!this.user || (this.isNewUserOrUserWithoutPassword && this.password.getValue().length > 0 && this.password.isValid());
    // }

    getPassword(): string {
        return this.password.getValue();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.setOrChangePasswordButton.addClass('change-password-button');

            if (this.isSystemUser) {
                this.publicKeysGrid.insertBeforeEl(this.addPublicKeyButton);
                if (!!this.user) {
                    this.publicKeysGrid.setUser(this.user);
                }
            }

            return rendered;
        });
    }
}
