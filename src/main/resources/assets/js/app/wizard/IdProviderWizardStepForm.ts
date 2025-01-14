import {IdProviderConfig} from '@enonic/lib-admin-ui/security/IdProviderConfig';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {PropertySet} from '@enonic/lib-admin-ui/data/PropertySet';
import {PropertyTree} from '@enonic/lib-admin-ui/data/PropertyTree';
import {IdProvider} from '../principal/IdProvider';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {TextInput} from '@enonic/lib-admin-ui/ui/text/TextInput';
import {AuthApplicationComboBox, AuthApplicationComboBoxWrapper} from '../inputtype/authapplicationselector/AuthApplicationComboBox';
import {ApplicationConfigProvider} from '@enonic/lib-admin-ui/form/inputtype/appconfig/ApplicationConfigProvider';
import {PropertyArray} from '@enonic/lib-admin-ui/data/PropertyArray';
import {ValueTypePropertySet} from '@enonic/lib-admin-ui/data/ValueTypePropertySet';
import {AuthApplicationSelectedOptionView} from '../inputtype/authapplicationselector/AuthApplicationSelectedOptionView';
import {AuthApplicationSelectedOptionsView} from '../inputtype/authapplicationselector/AuthApplicationSelectedOptionsView';
import {ApplicationConfig} from '@enonic/lib-admin-ui/application/ApplicationConfig';
import {ValidationRecording} from '@enonic/lib-admin-ui/form/ValidationRecording';
import {WizardStepValidityChangedEvent} from '@enonic/lib-admin-ui/app/wizard/WizardStepValidityChangedEvent';
import {FormValidityChangedEvent} from '@enonic/lib-admin-ui/form/FormValidityChangedEvent';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {SelectionChange} from '@enonic/lib-admin-ui/util/SelectionChange';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {IdProviderWizardPanelParams} from './IdProviderWizardPanelParams';

export class IdProviderWizardStepForm
    extends UserItemWizardStepForm<IdProvider> {

    private description: TextInput;

    private applicationComboBox: AuthApplicationComboBox;

    private wrapper: AuthApplicationComboBoxWrapper;

    constructor(params: IdProviderWizardPanelParams) {
        super(params, 'idprovider-wizard-step-form');
    }

    protected initElements(): void {
        super.initElements();

        this.description = new TextInput('middle');

        this.applicationComboBox = new AuthApplicationComboBox(this.createApplicationConfigProvider(), false);
        this.wrapper = new AuthApplicationComboBoxWrapper(this.applicationComboBox);
    }

    protected initListeners(): void {
        super.initListeners();

        this.applicationComboBox.onSelectionChanged((selectionChange: SelectionChange<Application>) => {
            if (selectionChange.selected?.length > 0) {
                const selectedIdProviderOptionView: AuthApplicationSelectedOptionView =
                    this.applicationComboBox.getSelectedOptions()[0].getOptionView() as AuthApplicationSelectedOptionView;

                selectedIdProviderOptionView.getFormView().onValidityChanged((event: FormValidityChangedEvent) => {
                    this.previousValidation = event.getRecording();
                    this.notifyValidityChanged(new WizardStepValidityChangedEvent(event.isValid()));
                });
            }

            if (selectionChange.deselected?.length > 0) {
                this.previousValidation = new ValidationRecording();
                this.notifyValidityChanged(new WizardStepValidityChangedEvent(true));
            }
        });
    }

    protected createFormItems(): FormItem[] {
        const descriptionFormItem: FormItem = new FormItemBuilder(this.description).setLabel(i18n('field.description')).build();
        const appComboBox: FormItem = new FormItemBuilder(this.wrapper).setLabel(i18n('field.application')).build();
        return [descriptionFormItem, appComboBox];
    }

    private createApplicationConfigProvider(): ApplicationConfigProvider {
        const propertyArray: PropertyArray = PropertyArray.create()
            .setName('idProviderConfig')
            .setType(new ValueTypePropertySet())
            .setParent(new PropertyTree().getRoot())
            .build();

        return new ApplicationConfigProvider(propertyArray);
    }

    layout(idProvider: IdProvider): void {
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

        if (this.wrapper.isDirty()) {
            if (ObjectHelper.stringEquals(this.wrapper.getValue(),
                idProvider.getIdProviderConfig()?.getApplicationKey().toString())) {
                this.wrapper.resetBaseValues();
            }
        } else {
            this.layoutApplicationCombobox(idProvider);
        }
    }

    private layoutApplicationCombobox(idProvider: IdProvider) {
        const config: IdProviderConfig = idProvider.getIdProviderConfig();
        this.applicationComboBox.preSelectApplication(config?.getApplicationKey());
        this.applicationComboBox.getSelectedOptionsView().setReadonly(idProvider.getKey().isSystem());

        if (!config) {
            (this.applicationComboBox.getSelectedOptionsView() as AuthApplicationSelectedOptionsView).setApplicationConfigProvider(
                this.createApplicationConfigProvider());
            return;
        }

        const selectedOptionView: AuthApplicationSelectedOptionView = this.applicationComboBox.getSelectedOptionViews()[0];
        if (selectedOptionView) {
            selectedOptionView.setSiteConfig(this.createApplicationConfig(config));
            return;
        }

        const selectedOptionsView: AuthApplicationSelectedOptionsView =
            this.applicationComboBox.getSelectedOptionsView() as AuthApplicationSelectedOptionsView;

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
