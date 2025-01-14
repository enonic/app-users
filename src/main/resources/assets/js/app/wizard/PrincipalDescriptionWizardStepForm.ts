import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {TextInput} from '@enonic/lib-admin-ui/ui/text/TextInput';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {Validators} from '@enonic/lib-admin-ui/ui/form/Validators';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';

export class PrincipalDescriptionWizardStepForm
    extends UserItemWizardStepForm<Principal> {

    private description: TextInput;

    constructor(params: PrincipalWizardPanelParams) {
        super(params, 'principal-description-wizard-step-form');
    }

    protected initElements(): void {
        super.initElements();

        this.description = new TextInput('middle');
    }

    protected createFormItems(): FormItem[] {
        const descriptionFormItem: FormItem =
            new FormItemBuilder(this.description).setLabel(i18n('field.description')).setValidator(Validators.required).build();
        return [descriptionFormItem];
    }

    layout(principal: Principal): void {
        const description: string = !!principal.getDescription() ? principal.getDescription() : '';

        if (this.description.isDirty()) {
            if (ObjectHelper.stringEquals(this.description.getValue(), description)) {
                this.description.resetBaseValues();
            }
        } else {
            this.description.setValue(description);
        }
    }

    giveFocus(): boolean {
        return this.description.giveFocus();
    }

    getDescription(): string {
        return this.description.getValue();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.description.addClass('description');
            this.appendChild(this.form);

            return rendered;
        });
    }
}
