import {WizardStepForm} from '@enonic/lib-admin-ui/app/wizard/WizardStepForm';
import {FormItem} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {Fieldset} from '@enonic/lib-admin-ui/ui/form/Fieldset';
import {Form} from '@enonic/lib-admin-ui/ui/form/Form';
import {FormView} from '@enonic/lib-admin-ui/form/FormView';
import {ValidityChangedEvent} from '@enonic/lib-admin-ui/ValidityChangedEvent';
import {WizardStepValidityChangedEvent} from '@enonic/lib-admin-ui/app/wizard/WizardStepValidityChangedEvent';

export abstract class UserItemWizardStepForm
    extends WizardStepForm {

    protected form: Form;

    protected fieldSet: Fieldset;

    protected constructor(className?: string) {
        super(className);
        this.addClass('user-item-wizard-step-form');
    }

    initialize(): void {
        this.initElements();
        this.postInitElements();
        this.initListeners();
    }

    protected initElements(): void {
        this.form = new Form(FormView.VALIDATION_CLASS);
    }

    protected postInitElements(): void {
        this.fieldSet = new Fieldset();
        this.createFormItems().forEach((formItem: FormItem) => this.fieldSet.add(formItem));
        this.form.add(this.fieldSet);
    }

    protected abstract createFormItems(): FormItem[];

    protected initListeners(): void {
        this.form.onFocus((event) => {
            this.notifyFocused(event);
        });

        this.form.onBlur((event) => {
            this.notifyBlurred(event);
        });

        this.form.onValidityChanged((event: ValidityChangedEvent) => {
            this.notifyValidityChanged(new WizardStepValidityChangedEvent(event.isValid()));
        });
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.form);

            return rendered;
        });
    }

}
