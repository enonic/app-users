import {IdProviderConfig} from 'lib-admin-ui/security/IdProviderConfig';
import {FormItem, FormItemBuilder} from 'lib-admin-ui/ui/form/FormItem';
import {PropertySet} from 'lib-admin-ui/data/PropertySet';
import {PropertyTree} from 'lib-admin-ui/data/PropertyTree';
import {SecurityFormContext} from './SecurityFormContext';
import {IdProvider} from '../principal/IdProvider';
import {WizardStepForm} from 'lib-admin-ui/app/wizard/WizardStepForm';
import {i18n} from 'lib-admin-ui/util/Messages';
import {Form} from 'lib-admin-ui/ui/form/Form';
import {Fieldset} from 'lib-admin-ui/ui/form/Fieldset';
import {TextInput} from 'lib-admin-ui/ui/text/TextInput';
import {
    AuthApplicationComboBox,
    AuthApplicationComboBoxBuilder
} from '../inputtype/authapplicationselector/AuthApplicationComboBox';
import {ApplicationConfigProvider} from 'lib-admin-ui/form/inputtype/appconfig/ApplicationConfigProvider';
import {PropertyArray} from 'lib-admin-ui/data/PropertyArray';
import {ValueTypePropertySet} from 'lib-admin-ui/data/ValueTypePropertySet';
import {AuthApplicationSelectedOptionView} from '../inputtype/authapplicationselector/AuthApplicationSelectedOptionView';
import {AuthApplicationSelectedOptionsView} from '../inputtype/authapplicationselector/AuthApplicationSelectedOptionsView';
import {ApplicationConfig} from 'lib-admin-ui/application/ApplicationConfig';
import {ValidationRecording} from 'lib-admin-ui/form/ValidationRecording';
import {WizardStepValidityChangedEvent} from 'lib-admin-ui/app/wizard/WizardStepValidityChangedEvent';
import {FormValidityChangedEvent} from 'lib-admin-ui/form/FormValidityChangedEvent';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';

export class IdProviderWizardStepForm
    extends WizardStepForm {

    private description: TextInput;

    private applicationComboBox: AuthApplicationComboBox;

    private idProviderFormContext: SecurityFormContext;

    constructor() {
        super();

        this.appendChild(this.createForm());
    }

    private createForm(): Form {
        const fieldSet: Fieldset = new Fieldset();
        fieldSet.add(this.createDescriptionFormItem());
        fieldSet.add(this.createIdProviderFormItem());

        const form: Form = new Form().add(fieldSet);

        form.onFocus((event) => {
            this.notifyFocused(event);
        });

        form.onBlur((event) => {
            this.notifyBlurred(event);
        });

        return form;
    }

    private createDescriptionFormItem(): FormItem {
        this.description = new TextInput('middle');
        return new FormItemBuilder(this.description).setLabel(i18n('field.description')).build();
    }

    private createIdProviderFormItem(): FormItem {
        const propertyArray: PropertyArray = PropertyArray.create()
            .setName('idProviderConfig')
            .setType(new ValueTypePropertySet())
            .setParent(new PropertyTree().getRoot())
            .build();

        this.idProviderFormContext = SecurityFormContext.create().build();

        const selectedOptionsView: AuthApplicationSelectedOptionsView =
            new AuthApplicationSelectedOptionsView(new ApplicationConfigProvider(propertyArray),
                this.idProviderFormContext, false);

        this.applicationComboBox = <AuthApplicationComboBox>new AuthApplicationComboBoxBuilder()
            .setSelectedOptionsView(selectedOptionsView)
            .build();
        this.applicationComboBox.addClass('application-configurator');

        this.applicationComboBox.onOptionSelected(() => {
            const selectedIdProviderOptionView: AuthApplicationSelectedOptionView =
                <AuthApplicationSelectedOptionView>selectedOptionsView.getSelectedOptions()[0].getOptionView();

            selectedIdProviderOptionView.getFormView().onValidityChanged((event: FormValidityChangedEvent) => {
                this.previousValidation = event.getRecording();
                this.notifyValidityChanged(new WizardStepValidityChangedEvent(event.isValid()));
            });
        });

        this.applicationComboBox.onOptionDeselected(() => {
            this.previousValidation = new ValidationRecording();
            this.notifyValidityChanged(new WizardStepValidityChangedEvent(true));
        });

        return new FormItemBuilder(this.applicationComboBox).setLabel(i18n('field.application')).build();
    }

    layout(idProvider: IdProvider) {
        if (!idProvider) {
            return;
        }

        const description: string = !!idProvider.getDescription() ? idProvider.getDescription() : '';

        if (this.description.isDirty()) {
            if (ObjectHelper.stringEquals(this.description.getValue(), description)) {
                this.description.resetBaseValues();
            }
        } else {
            this.description.setValue(description);
        }

        if (this.applicationComboBox.isDirty()) {
            if (ObjectHelper.stringEquals(this.applicationComboBox.getValue(),
                idProvider.getIdProviderConfig()?.getApplicationKey().toString())) {
                this.applicationComboBox.resetBaseValues();
            }
        } else {
            this.layoutApplicationCombobox(idProvider);
        }
    }

    private layoutApplicationCombobox(idProvider: IdProvider) {
        const config: IdProviderConfig = idProvider.getIdProviderConfig();
        this.applicationComboBox.setValue(!!config ? config.getApplicationKey().toString() : '');
        this.idProviderFormContext.setIdProvider(idProvider);
        this.applicationComboBox.getSelectedOptionView().setReadonly(idProvider.getKey().isSystem());

        if (!config) {
            return;
        }

        const selectedOptionView: AuthApplicationSelectedOptionView = this.applicationComboBox.getSelectedOptionViews()[0];
        if (selectedOptionView) {
            selectedOptionView.setSiteConfig(this.createApplicationConfig(config));
            return;
        }

        const selectedOptionsView: AuthApplicationSelectedOptionsView =
            (<AuthApplicationSelectedOptionsView>this.applicationComboBox.getSelectedOptionView());

        const optionViewAddedListener = (optionView: AuthApplicationSelectedOptionView) => {
            optionView.setSiteConfig(this.createApplicationConfig(config));
            selectedOptionsView.unAfterOptionCreated(optionViewAddedListener);
        };

        selectedOptionsView.onAfterOptionCreated(optionViewAddedListener);
    }

    private createApplicationConfig(idProviderConfig: IdProviderConfig): ApplicationConfig {
        return ApplicationConfig.create()
            .setApplicationKey(idProviderConfig.getApplicationKey())
            .setConfig(idProviderConfig.getConfig().copy().getRoot())
            .build();
    }

    getIdProviderConfig(): IdProviderConfig {
        const selectedItems: AuthApplicationSelectedOptionView[] = this.applicationComboBox.getSelectedOptionViews();
        if (selectedItems.length === 0) {
            return null;
        }

        const selectedAppView: AuthApplicationSelectedOptionView = selectedItems[0];
        const config: PropertySet = selectedAppView.getSiteConfig().getConfig();
        config.removeEmptySets();

        return IdProviderConfig.create()
            .setApplicationKey(selectedAppView.getApplication().getApplicationKey())
            .setConfig(new PropertyTree(config))
            .build();
    }

    getDescription(): string {
        return this.description.getValue();
    }

    giveFocus(): boolean {
        return this.description.giveFocus();
    }
}
