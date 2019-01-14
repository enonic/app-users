import i18n = api.util.i18n;
import IdProviderConfig = api.security.IdProviderConfig;
import {SecurityFormContext} from './SecurityFormContext';
import {IdProvider} from '../principal/IdProvider';

export class IdProviderWizardStepForm
    extends api.app.wizard.WizardStepForm {

    private formView: api.form.FormView;

    private propertySet: api.data.PropertySet;

    constructor() {
        super();
    }

    layout(idProvider: IdProvider): wemQ.Promise<void> {

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

            let formViewValid = this.formView.isValid();
            this.notifyValidityChanged(new api.app.wizard.WizardStepValidityChangedEvent(formViewValid));
        });
    }

    getIdProviderConfig(): IdProviderConfig {
        let idProviderConfigPropertySet = this.propertySet.getPropertySet('idProviderConfig');
        if (idProviderConfigPropertySet) {
            let applicationKey = api.application.ApplicationKey.fromString(idProviderConfigPropertySet.getString('applicationKey'));
            let config = new api.data.PropertyTree(idProviderConfigPropertySet.getPropertySet('config'));
            return IdProviderConfig.create().setApplicationKey(applicationKey).setConfig(config).build();
        }

        return null;
    }

    public validate(silent?: boolean): api.form.ValidationRecording {
        return this.formView.validate(silent);
    }

    private createFormView(idProvider?: IdProvider): api.form.FormView {
        let isSystemIdProvider = (!!idProvider && idProvider.getKey().isSystem()).toString();
        let formBuilder = new api.form.FormBuilder().
            addFormItem(new api.form.InputBuilder().
                setName('description').
                setInputType(api.form.inputtype.text.TextLine.getName()).
                setLabel(i18n('field.description')).
                setOccurrences(new api.form.OccurrencesBuilder().setMinimum(0).setMaximum(1).build()).
                setInputTypeConfig({}).
                setMaximizeUIInputWidth(true).
                build()).addFormItem(new api.form.InputBuilder().setName('idProviderConfig').setInputType(
            new api.form.InputTypeName('AuthApplicationSelector', false)).setLabel(i18n('field.application')).setOccurrences(
            new api.form.OccurrencesBuilder().setMinimum(0).setMaximum(1).build()).setInputTypeConfig(
            {readOnly: [{value: isSystemIdProvider}]}).
                setMaximizeUIInputWidth(true).
                build());

        this.propertySet = new api.data.PropertyTree().getRoot();
        if (idProvider) {
            this.propertySet.addString('description', idProvider.getDescription());
            let idProviderConfig = idProvider.getIdProviderConfig();
            if (idProviderConfig) {
                let idProviderConfigPropertySet = new api.data.PropertySet();
                idProviderConfigPropertySet.addString('applicationKey', idProviderConfig.getApplicationKey().toString());
                idProviderConfigPropertySet.addPropertySet('config', idProviderConfig.getConfig().getRoot());
                this.propertySet.addPropertySet('idProviderConfig', idProviderConfigPropertySet);
            }
        }

        const context = SecurityFormContext.create().setIdProvider(idProvider).build();
        return new api.form.FormView(context, formBuilder.build(), this.propertySet);
    }

    getDescription(): string {
        return this.propertySet.getString('description');
    }

    giveFocus(): boolean {
        return this.formView.giveFocus();
    }
}
