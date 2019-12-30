import {Role} from '../principal/Role';
import {Group} from '../principal/Group';
import {Principal} from 'lib-admin-ui/security/Principal';
import {WizardStepForm} from 'lib-admin-ui/app/wizard/WizardStepForm';
import {TextInput} from 'lib-admin-ui/ui/text/TextInput';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {LabelEl} from 'lib-admin-ui/dom/LabelEl';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';

export class PrincipalDescriptionWizardStepForm
    extends WizardStepForm {

    private description: TextInput;

    constructor() {
        super();

        this.description = new TextInput('middle');
        this.description.onFocus((event) => {
            this.notifyFocused(event);
        });
        this.description.onBlur((event) => {
            this.notifyBlurred(event);
        });
        let formView = new DivEl('form-view');
        let inputView = new DivEl('input-view valid');
        let label = new LabelEl(i18n('field.description'), this.description, 'input-label');
        let inputTypeView = new DivEl('input-type-view');
        let inputOccurrenceView = new DivEl('input-occurrence-view single-occurrence');
        let inputWrapper = new DivEl('input-wrapper');

        inputWrapper.appendChild(this.description);
        inputOccurrenceView.appendChild(inputWrapper);
        inputTypeView.appendChild(inputOccurrenceView);
        inputView.appendChild(label);
        inputView.appendChild(inputTypeView);
        formView.appendChild(inputView);

        this.appendChild(formView);
    }

    layout(principal: Principal) {
        if (ObjectHelper.iFrameSafeInstanceOf(principal, Role)
            || ObjectHelper.iFrameSafeInstanceOf(principal, Group)) {
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
