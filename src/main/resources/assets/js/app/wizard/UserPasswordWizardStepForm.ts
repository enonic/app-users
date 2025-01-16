import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {User} from '../principal/User';
import {IdProviderKey} from '@enonic/lib-admin-ui/security/IdProviderKey';
import {PasswordSection} from './PasswordSection';
import {PublicKeysSection} from './PublicKeysSection';
import {SetPasswordButtonClickedEvent} from './SetPasswordButtonClickedEvent';
import {Validators} from '@enonic/lib-admin-ui/ui/form/Validators';

export class UserPasswordWizardStepForm
    extends UserItemWizardStepForm {

    private passwordSection: PasswordSection;

    private passwordFormItem: FormItem;

    private publicKeysSection?: PublicKeysSection;

    private publicKeyFormItem?: FormItem;

    private user?: User;

    private idProviderKey: IdProviderKey;

    constructor(idProviderKey: IdProviderKey, user?: User) {
        super('user-password-wizard-step-form');

        this.idProviderKey = idProviderKey;
        this.user = user;
    }

    private isSystemUser(): boolean {
        return this.idProviderKey.isSystem();
    }

    protected initElements(): void {
        super.initElements();

        this.passwordSection = new PasswordSection(this.user);
        this.passwordSection.initialize();

        if (this.isSystemUser()) {
            this.publicKeysSection = new PublicKeysSection(this.user);
            this.publicKeysSection.initialize();
        }
    }

    protected initListeners() {
        super.initListeners();

        SetPasswordButtonClickedEvent.on((event) => {
            this.passwordFormItem.getLabel().setVisible(event.isShowLabel());
            this.passwordFormItem.setValidator(Validators.required);
        });
    }

    protected createFormItems(): FormItem[] {
        const formItems: FormItem[] = [];

        this.passwordFormItem = new FormItemBuilder(this.passwordSection).setLabel(i18n('field.password')).build();
        this.passwordFormItem.getLabel().setVisible(false);

        formItems.push(this.passwordFormItem);


        if (this.isSystemUser()) {
            this.publicKeyFormItem = new FormItemBuilder(this.publicKeysSection).setLabel(i18n('field.userKeys.grid.title')).build();
            formItems.push(this.publicKeyFormItem);
        }

        return formItems;
    }

    layout(user: User): void {
        this.updatePrincipal(user);
    }

    updatePrincipal(user: User): void {
        this.user = user;

        new SetPasswordButtonClickedEvent(false).fire();

        if (!!this.user) {
            this.passwordSection.updateView(this.user);

            if (this.isSystemUser()) {
                this.publicKeysSection.updateView(this.user);
            }
        }
    }

    getPassword(): string {
        return this.passwordSection.getPassword();
    }

    isValid(): boolean {
        if (!this.passwordSection.isPasswordVisible()) {
            return true;
        }

        return this.passwordSection.isValidPassword();
    }
}
