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
import {UserItemWizardStepForm} from './UserItemWizardStepForm';

export class IdProviderWizardStepForm
    extends UserItemWizardStepForm {

    private description: TextInput;

    private applicationComboBox: AuthApplicationComboBox;

    private idProviderFormContext: SecurityFormContext;

    private selectedOptionsView: AuthApplicationSelectedOptionsView;

    constructor() {
        super('idprovider-wizard-step-form');
    }

    protected initElements() {
        super.initElements();

        this.description = new TextInput('middle');

        const propertyArray: PropertyArray = PropertyArray.create()
            .setName('idProviderConfig')
            .setType(new ValueTypePropertySet())
            .setParent(new PropertyTree().getRoot())
            .build();

        this.idProviderFormContext = SecurityFormContext.create().build();
        this.selectedOptionsView =
            new AuthApplicationSelectedOptionsView(new ApplicationConfigProvider(propertyArray), this.idProviderFormContext, false);

        this.applicationComboBox = <AuthApplicationComboBox>new AuthApplicationComboBoxBuilder()
            .setSelectedOptionsView(this.selectedOptionsView)
            .build();
    }

    protected initListeners() {
        super.initListeners();

        this.applicationComboBox.onOptionSelected(() => {
            const selectedIdProviderOptionView: AuthApplicationSelectedOptionView =
                <AuthApplicationSelectedOptionView>this.selectedOptionsView.getSelectedOptions()[0].getOptionView();

            selectedIdProviderOptionView.getFormView().onValidityChanged((event: FormValidityChangedEvent) => {
                this.previousValidation = event.getRecording();
                this.notifyValidityChanged(new WizardStepValidityChangedEvent(event.isValid()));
            });
        });

        this.applicationComboBox.onOptionDeselected(() => {
            this.previousValidation = new ValidationRecording();
            this.notifyValidityChanged(new WizardStepValidityChangedEvent(true));
        });
    }

    protected createFormItems(): FormItem[] {
        const descriptionFormItem: FormItem = new FormItemBuilder(this.description).setLabel(i18n('field.description')).build();
        const appComboBox: FormItem = new FormItemBuilder(this.applicationComboBox).setLabel(i18n('field.application')).build();
        return [descriptionFormItem, appComboBox];
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


    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.applicationComboBox.addClass('application-configurator');

            return rendered;
        });
    }
}
