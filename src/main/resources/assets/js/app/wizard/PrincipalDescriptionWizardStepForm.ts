import {Role} from '../principal/Role';
import {Group} from '../principal/Group';
import Principal = api.security.Principal;
import i18n = api.util.i18n;

export class PrincipalDescriptionWizardStepForm extends api.app.wizard.WizardStepForm {

    private description: api.ui.text.TextInput;

    constructor() {
        super();

        this.description = new api.ui.text.TextInput('middle');
        this.description.onFocus((event) => {
            this.notifyFocused(event);
        });
        this.description.onBlur((event) => {
            this.notifyBlurred(event);
        });
        let formView = new api.dom.DivEl('form-view');
        let inputView = new api.dom.DivEl('input-view valid');
        let label = new api.dom.LabelEl(i18n('field.description'), this.description, 'input-label');
        let inputTypeView = new api.dom.DivEl('input-type-view');
        let inputOccurrenceView = new api.dom.DivEl('input-occurrence-view single-occurrence');
        let inputWrapper = new api.dom.DivEl('input-wrapper');

        inputWrapper.appendChild(this.description);
        inputOccurrenceView.appendChild(inputWrapper);
        inputTypeView.appendChild(inputOccurrenceView);
        inputView.appendChild(label);
        inputView.appendChild(inputTypeView);
        formView.appendChild(inputView);

        this.appendChild(formView);
    }

    layout(principal: Principal) {
        if (api.ObjectHelper.iFrameSafeInstanceOf(principal, Role)
            || api.ObjectHelper.iFrameSafeInstanceOf(principal, Group)) {
            let description = principal.getDescription();
            this.description.setValue(!!description ? description : '');
        } else {
            this.description.setValue('');
        }

    }

    giveFocus(): boolean {
        return this.description.giveFocus();
    }

    getDescription(): string {
        return this.description.getValue();
    }
}
