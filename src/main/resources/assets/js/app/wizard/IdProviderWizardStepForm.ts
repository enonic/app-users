import i18n = api.util.i18n;
import IdProviderConfig = api.security.IdProviderConfig;
import FormItem = api.form.FormItem;
import PropertySet = api.data.PropertySet;
import FormView = api.form.FormView;
import FormBuilder = api.form.FormBuilder;
import PropertyTree = api.data.PropertyTree;
import ApplicationKey = api.application.ApplicationKey;
import Form = api.form.Form;
import {SecurityFormContext} from './SecurityFormContext';
import {IdProvider} from '../principal/IdProvider';

export class IdProviderWizardStepForm
    extends api.app.wizard.WizardStepForm {

    private formView: FormView;

    private propertySet: PropertySet;

    constructor() {
        super();
    }

    layout(idProvider: IdProvider): wemQ.Promise<void> {

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

            this.formView.onValidityChanged((event: api.form.FormValidityChangedEvent) => {
                this.previousValidation = event.getRecording();
                this.notifyValidityChanged(new api.app.wizard.WizardStepValidityChangedEvent(event.isValid()));
            });

            this.notifyValidityChanged(new api.app.wizard.WizardStepValidityChangedEvent(this.formView.isValid()));
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

    public validate(silent?: boolean): api.form.ValidationRecording {
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
        return new api.form.InputBuilder()
            .setName('description')
            .setInputType(api.form.inputtype.text.TextLine.getName())
            .setLabel(i18n('field.description'))
            .setOccurrences(new api.form.OccurrencesBuilder().setMinimum(0).setMaximum(1).build())
            .setInputTypeConfig({})
            .setMaximizeUIInputWidth(true)
            .build();
    }

    private createAuthAppSelectorFormItem(idProvider?: IdProvider): FormItem {
        const isSystemIdProvider: string = (!!idProvider && idProvider.getKey().isSystem()).toString();

        return new api.form.InputBuilder()
            .setName('idProviderConfig')
            .setInputType(new api.form.InputTypeName('AuthApplicationSelector', false))
            .setLabel(i18n('field.application'))
            .setOccurrences(new api.form.OccurrencesBuilder().setMinimum(0).setMaximum(1).build())
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
