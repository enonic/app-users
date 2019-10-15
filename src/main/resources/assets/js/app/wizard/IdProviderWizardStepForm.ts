import {IdProviderConfig} from 'lib-admin-ui/security/IdProviderConfig';
import {FormItem} from 'lib-admin-ui/form/FormItem';
import {PropertySet} from 'lib-admin-ui/data/PropertySet';
import {FormView} from 'lib-admin-ui/form/FormView';
import {PropertyTree} from 'lib-admin-ui/data/PropertyTree';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {Form, FormBuilder} from 'lib-admin-ui/form/Form';
import {SecurityFormContext} from './SecurityFormContext';
import {IdProvider} from '../principal/IdProvider';
import {WizardStepForm} from 'lib-admin-ui/app/wizard/WizardStepForm';
import {FormValidityChangedEvent} from 'lib-admin-ui/form/FormValidityChangedEvent';
import {WizardStepValidityChangedEvent} from 'lib-admin-ui/app/wizard/WizardStepValidityChangedEvent';
import {ValidationRecording} from 'lib-admin-ui/form/ValidationRecording';
import {InputBuilder} from 'lib-admin-ui/form/Input';
import {i18n} from 'lib-admin-ui/util/Messages';
import {OccurrencesBuilder} from 'lib-admin-ui/form/Occurrences';
import {InputTypeName} from 'lib-admin-ui/form/InputTypeName';
import {TextLine} from 'lib-admin-ui/form/inputtype/text/TextLine';

export class IdProviderWizardStepForm
    extends WizardStepForm {

    private formView: FormView;

    private propertySet: PropertySet;

    constructor() {
        super();
    }

    layout(idProvider: IdProvider): Q.Promise<void> {

        this.propertySet = this.createPropertySet(idProvider);
        this.formView = this.createFormView(idProvider);

        return this.formView.layout().then(() => {

            this.formView.onFocus((event) => {
                this.notifyFocused(event);
            });
            this.formView.onBlur((event) => {
                this.notifyBlurred(event);
            });

            this.appendChild(this.formView);

            this.formView.onValidityChanged((event: FormValidityChangedEvent) => {
                this.previousValidation = event.getRecording();
                this.notifyValidityChanged(new WizardStepValidityChangedEvent(event.isValid()));
            });

            this.notifyValidityChanged(new WizardStepValidityChangedEvent(this.formView.isValid()));
        });
    }

    getIdProviderConfig(): IdProviderConfig {
        const idProviderConfigPropertySet: PropertySet = this.propertySet.getPropertySet('idProviderConfig');

        if (idProviderConfigPropertySet) {
            idProviderConfigPropertySet.removeEmptySets();
            const applicationKey: ApplicationKey = ApplicationKey.fromString(idProviderConfigPropertySet.getString('applicationKey'));
            const config: PropertyTree = new PropertyTree(idProviderConfigPropertySet.getPropertySet('config'));


            return IdProviderConfig.create().setApplicationKey(applicationKey).setConfig(config).build();
        }

        return null;
    }

    public validate(silent?: boolean): ValidationRecording {
        return this.formView.validate(silent);
    }

    private createPropertySet(idProvider?: IdProvider): PropertySet {
        const propertySet: PropertySet = new PropertyTree().getRoot();

        if (idProvider) {
            propertySet.addString('description', idProvider.getDescription());

            const idProviderConfig: IdProviderConfig = idProvider.getIdProviderConfig();
            if (idProviderConfig) {
                const idProviderConfigPropertySet: PropertySet = new PropertySet();
                const applicationKeyAsString: string = idProviderConfig.getApplicationKey().toString();
                const config: PropertySet = idProviderConfig.getConfig().getRoot();
                config.removeEmptySets();
                idProviderConfigPropertySet.addString('applicationKey', applicationKeyAsString);
                idProviderConfigPropertySet.addPropertySet('config', config);
                propertySet.addPropertySet('idProviderConfig', idProviderConfigPropertySet);
            }
        }

        return propertySet;
    }

    private createFormView(idProvider?: IdProvider): FormView {
        const form: Form = new FormBuilder()
            .addFormItem(this.createDescriptionFormItem())
            .addFormItem(this.createAuthAppSelectorFormItem(idProvider))
            .build();

        const context: SecurityFormContext = SecurityFormContext.create().setIdProvider(idProvider).build();

        return new FormView(context, form, this.propertySet);
    }

    private createDescriptionFormItem(): FormItem {
        return new InputBuilder()
            .setName('description')
            .setInputType(TextLine.getName())
            .setLabel(i18n('field.description'))
            .setOccurrences(new OccurrencesBuilder().setMinimum(0).setMaximum(1).build())
            .setInputTypeConfig({})
            .setMaximizeUIInputWidth(true)
            .build();
    }

    private createAuthAppSelectorFormItem(idProvider?: IdProvider): FormItem {
        const isSystemIdProvider: string = (!!idProvider && idProvider.getKey().isSystem()).toString();

        return new InputBuilder()
            .setName('idProviderConfig')
            .setInputType(new InputTypeName('AuthApplicationSelector', false))
            .setLabel(i18n('field.application'))
            .setOccurrences(new OccurrencesBuilder().setMinimum(0).setMaximum(1).build())
            .setInputTypeConfig({readOnly: [{value: isSystemIdProvider}]})
            .setMaximizeUIInputWidth(true)
            .build();
    }

    getDescription(): string {
        return this.propertySet.getString('description');
    }

    giveFocus(): boolean {
        return this.formView.giveFocus();
    }
}
