import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {EmailInput} from '@enonic/lib-admin-ui/ui/text/EmailInput';
import {Validators} from '@enonic/lib-admin-ui/ui/form/Validators';
import {IdProviderKey} from '@enonic/lib-admin-ui/security/IdProviderKey';
import {User} from '../principal/User';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {ValidityChangedEvent} from '@enonic/lib-admin-ui/ValidityChangedEvent';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {UrlHelper} from '../../util/UrlHelper';
import {CheckEmailAvailabilityRequest} from '@enonic/lib-admin-ui/security/CheckEmailAvailabilityRequest';
import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';

export class UserEmailWizardStepForm
    extends UserItemWizardStepForm<Principal> {

    private emailInput: EmailInput;

    private emailFormItem: FormItem;

    private readonly idProviderKey: IdProviderKey;

    private readonly isSystemUser: boolean;

    constructor(params: PrincipalWizardPanelParams) {
        super(params, 'user-email-wizard-step-form');

        this.idProviderKey = params.idProviderKey;
        this.isSystemUser = params.idProvider.getKey().isSystem();
    }



    protected initElements(): void {
        super.initElements();

        this.emailInput = new EmailInput();
        this.whenRendered(() => {
            this.emailInput.setRequest(new CheckEmailAvailabilityRequest(this.idProviderKey, UrlHelper.getRestUri('')));
        });
    }

    protected initListeners(): void {
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

    layout(principal: Principal): void {
        const user: User = (principal as User);

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
