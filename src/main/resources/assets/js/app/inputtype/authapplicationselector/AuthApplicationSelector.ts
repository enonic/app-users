import * as Q from 'q';
import {PropertyArray} from 'lib-admin-ui/data/PropertyArray';
import {FormView} from 'lib-admin-ui/form/FormView';
import {Value} from 'lib-admin-ui/data/Value';
import {ValueType} from 'lib-admin-ui/data/ValueType';
import {ValueTypes} from 'lib-admin-ui/data/ValueTypes';
import {SelectedOption} from 'lib-admin-ui/ui/selector/combobox/SelectedOption';
import {Application} from 'lib-admin-ui/application/Application';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {ApplicationConfig} from 'lib-admin-ui/application/ApplicationConfig';
import {SelectedOptionEvent} from 'lib-admin-ui/ui/selector/combobox/SelectedOptionEvent';
import {ApplicationConfigProvider} from 'lib-admin-ui/form/inputtype/appconfig/ApplicationConfigProvider';
import {InputTypeViewContext} from 'lib-admin-ui/form/inputtype/InputTypeViewContext';
import {FormContext} from 'lib-admin-ui/form/FormContext';
import {AuthApplicationSelectedOptionView} from './AuthApplicationSelectedOptionView';
import {AuthApplicationComboBox} from './AuthApplicationComboBox';
import {BaseInputTypeManagingAdd} from 'lib-admin-ui/form/inputtype/support/BaseInputTypeManagingAdd';
import {InputValidationRecording} from 'lib-admin-ui/form/inputtype/InputValidationRecording';
import {Class} from 'lib-admin-ui/Class';
import {InputTypeManager} from 'lib-admin-ui/form/inputtype/InputTypeManager';
import {Input} from 'lib-admin-ui/form/Input';
import {AuthApplicationSelectedOptionsView} from './AuthApplicationSelectedOptionsView';

export interface AuthApplicationSelectorConfig
    extends InputTypeViewContext {

    formContext: FormContext;

}

export class AuthApplicationSelector
    extends BaseInputTypeManagingAdd {

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

    layout(input: Input, propertyArray: PropertyArray): Q.Promise<void> {

        super.layout(input, propertyArray);

        this.applicationConfigProvider = new ApplicationConfigProvider(propertyArray);
        this.comboBox = this.createComboBox(input, this.applicationConfigProvider);

        this.appendChild(this.comboBox);

        this.setLayoutInProgress(false);

        return Q<void>(null);
    }

    update(propertyArray: PropertyArray, unchangedOnly?: boolean): Q.Promise<void> {
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

        const appKey = applicationConfig.getApplicationKey();
        const config = applicationConfig.getConfig();

        config.removeEmptySets();

        propertySet.setStringByPath('applicationKey', appKey.toString());
        propertySet.setPropertySetByPath('config', config);
    }

    protected getValueFromPropertyArray(propertyArray: PropertyArray): string {
        return propertyArray.getProperties().map((property) => {
            if (property.hasNonNullValue()) {
                const applicationConfig = ApplicationConfig.create().fromData(property.getPropertySet()).build();
                return applicationConfig.getApplicationKey().toString();
            }
        }).join(';');
    }

    private createComboBox(input: Input, applicationConfigProvider: ApplicationConfigProvider): AuthApplicationComboBox {

        const value = this.getValueFromPropertyArray(this.getPropertyArray());
        const applicationConfigFormsToDisplay = value.split(';');
        const selectedOptionsView: AuthApplicationSelectedOptionsView =
            new AuthApplicationSelectedOptionsView(applicationConfigProvider, this.readOnly);

        const comboBox: AuthApplicationComboBox = <AuthApplicationComboBox>AuthApplicationComboBox.create()
            .setMaximumOccurrences(input.getOccurrences().getMaximum() || 0)
            .setSelectedOptionsView(selectedOptionsView)
            .build();

        // creating selected option might involve property changes
        comboBox.onBeforeOptionCreated(() => this.ignorePropertyChange(true));
        comboBox.onAfterOptionCreated(() => this.ignorePropertyChange(false));

        const forcedValidate = () => {
            this.ignorePropertyChange(false);
            this.validate(false);
        };
        const saveAndForceValidate = (selectedOption: SelectedOption<Application>) => {
            const view: AuthApplicationSelectedOptionView = <AuthApplicationSelectedOptionView> selectedOption.getOptionView();
            this.saveToSet(view.getSiteConfig(), selectedOption.getIndex());
            forcedValidate();
        };

        comboBox.onOptionDeselected((event: SelectedOptionEvent<Application>) => {
            this.ignorePropertyChange(true);

            this.getPropertyArray().remove(event.getSelectedOption().getIndex());

            forcedValidate();
        });

        comboBox.onOptionSelected((event: SelectedOptionEvent<Application>) => {
            this.fireFocusSwitchEvent(event);

            this.ignorePropertyChange(true);

            const selectedOption = event.getSelectedOption();
            const key = selectedOption.getOption().getDisplayValue().getApplicationKey();
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

    protected getNumberOfValids(): number {

        return this.comboBox.countSelected();
    }

    validate(silent: boolean = true) {
        this.comboBox.getSelectedOptionViews().forEach((view: AuthApplicationSelectedOptionView) => {
            view.getFormView().validate(true);
        });

        super.validate(silent);
    }

    giveFocus(): boolean {
        if (this.comboBox.maximumOccurrencesReached()) {
            return false;
        }
        return this.comboBox.giveFocus();
    }
}

InputTypeManager.register(new Class('AuthApplicationSelector', AuthApplicationSelector));
