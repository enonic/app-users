import {Principal} from 'lib-admin-ui/security/Principal';
import {EmailInput} from 'lib-admin-ui/ui/text/EmailInput';
import {Validators} from 'lib-admin-ui/ui/form/Validators';
import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';
import {User} from '../principal/User';
import {FormItem, FormItemBuilder} from 'lib-admin-ui/ui/form/FormItem';
import {ValidityChangedEvent} from 'lib-admin-ui/ValidityChangedEvent';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';

export class UserEmailWizardStepForm
    extends UserItemWizardStepForm {

    private emailInput: EmailInput;

    private emailFormItem: FormItem;

    private readonly idProviderKey: IdProviderKey;

    private readonly isSystemUser: boolean;

    constructor(idProviderKey: IdProviderKey, isSystemUser: boolean) {
        super('user-email-wizard-step-form');

        this.idProviderKey = idProviderKey;
        this.isSystemUser = isSystemUser;
    }

    protected initElements() {
        super.initElements();

        this.emailInput = new EmailInput().setIdProviderKey(this.idProviderKey);
    }

    protected initListeners() {
        super.initListeners();

        this.form.onValidityChanged((event: ValidityChangedEvent) => {
            this.emailFormItem.toggleClass(FormItem.INVALID_CLASS, !event.isValid());
        });
    }

    protected createFormItems(): FormItem[] {
        this.emailFormItem =
            new FormItemBuilder(this.emailInput).setLabel(i18n('field.email')).setValidator(Validators.required).build();
        return [this.emailFormItem];
    }

    layout(principal: Principal) {
        const user: User = (<User>principal);

        if (this.emailInput.isDirty()) {
            if (ObjectHelper.stringEquals(this.emailInput.getValue(), user.getEmail())) {
                this.emailInput.resetBaseValues();
            }
        } else {
            this.emailInput.setValue(user.getEmail());
            this.emailInput.setName(user.getEmail());
            this.emailInput.setOriginEmail(user.getEmail());
        }
    }

    isValid(): boolean {
        return this.isSystemUser || this.emailInput.isValid();
    }

    getEmail(): string {
        return this.emailInput.getValue();
    }

    giveFocus(): boolean {
        return this.emailInput.giveFocus();
    }
}
