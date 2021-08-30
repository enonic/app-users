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
import {UrlHelper} from '../../util/UrlHelper';

export class UserEmailWizardStepForm
    extends UserItemWizardStepForm {

    private email: EmailInput;

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

        this.email = new EmailInput(UrlHelper.getRestUri('security/principals/emailAvailable'));
        this.email.setIdProviderKey(this.idProviderKey);
    }

    protected initListeners() {
        super.initListeners();

        this.form.onValidityChanged((event: ValidityChangedEvent) => {
            this.emailFormItem.toggleClass(FormItem.INVALID_CLASS, !event.isValid());
        });
    }

    protected createFormItems(): FormItem[] {
        this.emailFormItem =
            new FormItemBuilder(this.email).setLabel(i18n('field.email')).setValidator(Validators.required).build();
        return [this.emailFormItem];
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
