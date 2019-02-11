import PropertyArray = api.data.PropertyArray;
import FormView = api.form.FormView;
import Value = api.data.Value;
import ValueType = api.data.ValueType;
import ValueTypes = api.data.ValueTypes;
import SelectedOption = api.ui.selector.combobox.SelectedOption;
import Application = api.application.Application;
import ApplicationKey = api.application.ApplicationKey;
import ApplicationConfig = api.application.ApplicationConfig;
import SelectedOptionEvent = api.ui.selector.combobox.SelectedOptionEvent;
import ApplicationConfigProvider = api.form.inputtype.appconfig.ApplicationConfigProvider;
import InputTypeViewContext = api.form.inputtype.InputTypeViewContext;
import FormContext = api.form.FormContext;
import {AuthApplicationSelectedOptionView} from './AuthApplicationSelectedOptionView';
import {AuthApplicationComboBox} from './AuthApplicationComboBox';

export interface AuthApplicationSelectorConfig
    extends InputTypeViewContext {

    formContext: FormContext;

}

export class AuthApplicationSelector
    extends api.form.inputtype.support.BaseInputTypeManagingAdd {

    private comboBox: AuthApplicationComboBox;

    private applicationConfigProvider: ApplicationConfigProvider;

    private formContext: FormContext;

    private readOnly: boolean;

    constructor(config: AuthApplicationSelectorConfig) {
        super('application-configurator');
        this.readConfig(config.inputConfig);
        this.formContext = config.formContext;
    }

    getValueType(): ValueType {
        return ValueTypes.DATA;
    }

    newInitialValue(): Value {
        return null;
    }

    private readConfig(inputConfig: { [element: string]: { [name: string]: string }[]; }): void {
        let readOnlyConfig = inputConfig['readOnly'] && inputConfig['readOnly'][0];
        let readOnlyValue = readOnlyConfig && readOnlyConfig['value'];
        this.readOnly = readOnlyValue === 'true';
    }

    layout(input: api.form.Input, propertyArray: PropertyArray): wemQ.Promise<void> {

        super.layout(input, propertyArray);

        this.applicationConfigProvider = new ApplicationConfigProvider(propertyArray);
        this.comboBox = this.createComboBox(input, this.applicationConfigProvider);

        this.appendChild(this.comboBox);

        this.setLayoutInProgress(false);

        return wemQ<void>(null);
    }

    update(propertyArray: api.data.PropertyArray, unchangedOnly?: boolean): Q.Promise<void> {
        let superPromise = super.update(propertyArray, unchangedOnly);
        this.applicationConfigProvider.setPropertyArray(propertyArray);

        this.applicationConfigProvider.setPropertyArray(propertyArray);

        if (!unchangedOnly || !this.comboBox.isDirty()) {
            return superPromise.then(() => {
                this.comboBox.setValue(this.getValueFromPropertyArray(propertyArray));
            });
        } else {
            return superPromise;
        }
    }

    reset() {
        this.comboBox.resetBaseValues();
    }

    private saveToSet(applicationConfig: ApplicationConfig, index: number) {

        let propertySet = this.getPropertyArray().get(index).getPropertySet();
        if (!propertySet) {
            propertySet = this.getPropertyArray().addSet();
        }

        let config = applicationConfig.getConfig();
        let appKey = applicationConfig.getApplicationKey();

        propertySet.setStringByPath('applicationKey', appKey.toString());
        propertySet.setPropertySetByPath('config', config);
    }

    protected getValueFromPropertyArray(propertyArray: api.data.PropertyArray): string {
        return propertyArray.getProperties().map((property) => {
            if (property.hasNonNullValue()) {
                const applicationConfig = ApplicationConfig.create().fromData(property.getPropertySet()).build();
                return applicationConfig.getApplicationKey().toString();
            }
        }).join(';');
    }

    private createComboBox(input: api.form.Input, applicationConfigProvider: ApplicationConfigProvider): AuthApplicationComboBox {

        const value = this.getValueFromPropertyArray(this.getPropertyArray());
        const applicationConfigFormsToDisplay = value.split(';');
        const comboBox = new AuthApplicationComboBox(input.getOccurrences().getMaximum() || 0, applicationConfigProvider,
            this.formContext, value, this.readOnly);

        // creating selected option might involve property changes
        comboBox.onBeforeOptionCreated(() => this.ignorePropertyChange = true);
        comboBox.onAfterOptionCreated(() => this.ignorePropertyChange = false);

        const forcedValidate = () => {
            this.ignorePropertyChange = false;
            this.validate(false);
        };
        const saveAndForceValidate = (selectedOption: SelectedOption<Application>) => {
            const view: AuthApplicationSelectedOptionView = <AuthApplicationSelectedOptionView> selectedOption.getOptionView();
            this.saveToSet(view.getSiteConfig(), selectedOption.getIndex());
            forcedValidate();
        };

        comboBox.onOptionDeselected((event: SelectedOptionEvent<Application>) => {
            this.ignorePropertyChange = true;

            this.getPropertyArray().remove(event.getSelectedOption().getIndex());

            forcedValidate();
        });

        comboBox.onOptionSelected((event: SelectedOptionEvent<Application>) => {
            this.fireFocusSwitchEvent(event);

            this.ignorePropertyChange = true;

            const selectedOption = event.getSelectedOption();
            const key = selectedOption.getOption().displayValue.getApplicationKey();
            if (key) {
                saveAndForceValidate(selectedOption);
            }
        });

        comboBox.onOptionMoved((selectedOption: SelectedOption<Application>, fromIndex: number) => {
            this.getPropertyArray().move(fromIndex, selectedOption.getIndex());
            forcedValidate();
        });

        comboBox.onSiteConfigFormDisplayed((applicationKey: ApplicationKey, formView: FormView) => {
            let indexToRemove = applicationConfigFormsToDisplay.indexOf(applicationKey.toString());
            if (indexToRemove !== -1) {
                applicationConfigFormsToDisplay.splice(indexToRemove, 1);
            }

            formView.onValidityChanged(() => this.validate(false));

            this.validate(false);
        });

        return comboBox;
    }

    displayValidationErrors(value: boolean) {
        this.comboBox.getSelectedOptionViews().forEach((view: AuthApplicationSelectedOptionView) => {
            view.getFormView().displayValidationErrors(value);
        });
    }

    protected getNumberOfValids(): number {
        return this.comboBox.countSelected();
    }

    validate(silent: boolean = true): api.form.inputtype.InputValidationRecording {
        let recording = new api.form.inputtype.InputValidationRecording();

        this.comboBox.getSelectedOptionViews().forEach((view: AuthApplicationSelectedOptionView) => {

            let validationRecording = view.getFormView().validate(true);
            if (!validationRecording.isMinimumOccurrencesValid()) {
                recording.setBreaksMinimumOccurrences(true);
            }
            if (!validationRecording.isMaximumOccurrencesValid()) {
                recording.setBreaksMaximumOccurrences(true);
            }
        });

        return super.validate(silent, recording);
    }

    giveFocus(): boolean {
        if (this.comboBox.maximumOccurrencesReached()) {
            return false;
        }
        return this.comboBox.giveFocus();
    }
}

api.form.inputtype.InputTypeManager.register(new api.Class('AuthApplicationSelector', AuthApplicationSelector));
