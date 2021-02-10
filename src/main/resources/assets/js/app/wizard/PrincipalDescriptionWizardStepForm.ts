import {Principal} from 'lib-admin-ui/security/Principal';
import {WizardStepForm} from 'lib-admin-ui/app/wizard/WizardStepForm';
import {TextInput} from 'lib-admin-ui/ui/text/TextInput';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {Validators} from 'lib-admin-ui/ui/form/Validators';
import {FormItem, FormItemBuilder} from 'lib-admin-ui/ui/form/FormItem';
import {Fieldset} from 'lib-admin-ui/ui/form/Fieldset';
import {Form} from 'lib-admin-ui/ui/form/Form';
import {FormView} from 'lib-admin-ui/form/FormView';

export class PrincipalDescriptionWizardStepForm
    extends WizardStepForm {

    private description: TextInput;

    private form: Form;

    constructor() {
        super();

        this.initElements();
        this.initListeners();
    }

    private initElements() {
        this.description = new TextInput('middle');

        const descriptionFormItem: FormItem =
            new FormItemBuilder(this.description).setLabel(i18n('field.description')).setValidator(Validators.required).build();

        const fieldSet: Fieldset = new Fieldset();
        fieldSet.add(descriptionFormItem);

        this.form = new Form(FormView.VALIDATION_CLASS).add(fieldSet);
    }

    private initListeners() {
        this.form.onFocus((event) => {
            this.notifyFocused(event);
        });

        this.form.onBlur((event) => {
            this.notifyBlurred(event);
        });
    }

    layout(principal: Principal) {
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
