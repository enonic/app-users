import Application = api.application.Application;
import ApplicationKey = api.application.ApplicationKey;
import FormView = api.form.FormView;
import Option = api.ui.selector.Option;
import SelectedOption = api.ui.selector.combobox.SelectedOption;
import BaseSelectedOptionsView = api.ui.selector.combobox.BaseSelectedOptionsView;
import ApplicationConfigProvider = api.form.inputtype.appconfig.ApplicationConfigProvider;
import {AuthApplicationSelectedOptionView} from './AuthApplicationSelectedOptionView';

export class AuthApplicationSelectedOptionsView
    extends BaseSelectedOptionsView<Application> {

    private applicationConfigProvider: ApplicationConfigProvider;

    private applicationConfigFormDisplayedListeners: { (applicationKey: ApplicationKey, formView: FormView): void }[] = [];

    private beforeOptionCreatedListeners: { (): void }[] = [];

    private afterOptionCreatedListeners: { (): void }[] = [];

    private formContext: api.content.form.ContentFormContext;

    private items: AuthApplicationSelectedOptionView[] = [];

    private readOnly: boolean;

    constructor(applicationConfigProvider: ApplicationConfigProvider, formContext: api.content.form.ContentFormContext, readOnly: boolean) {
        super();
        this.readOnly = readOnly;
        this.applicationConfigProvider = applicationConfigProvider;
        this.formContext = formContext;

        this.applicationConfigProvider.onPropertyChanged(() => {

            this.items.forEach((optionView) => {
                let newConfig = this.applicationConfigProvider.getConfig(optionView.getSiteConfig().getApplicationKey(), false);
                if (newConfig) {
                    optionView.setSiteConfig(newConfig);
                }
            });

        });

        this.setOccurrencesSortable(true);
    }

    createSelectedOption(option: Option<Application>): SelectedOption<Application> {
        this.notifyBeforeOptionCreated();

        let applicationConfig = this.applicationConfigProvider.getConfig(option.displayValue.getApplicationKey());
        let optionView = new AuthApplicationSelectedOptionView(option, applicationConfig, this.formContext, this.readOnly);

        optionView.onApplicationConfigFormDisplayed((applicationKey: ApplicationKey) => {
            this.notifyApplicationConfigFormDisplayed(applicationKey, optionView.getFormView());
        });
        this.items.push(optionView);

        this.notifyAfterOptionCreated();
        return new SelectedOption<Application>(optionView, this.count());
    }

    removeOption(optionToRemove: api.ui.selector.Option<Application>, silent: boolean = false) {
        this.items =
            this.items.filter(item => !item.getSiteConfig().getApplicationKey().equals(optionToRemove.displayValue.getApplicationKey()));
        super.removeOption(optionToRemove, silent);
    }

    onApplicationConfigFormDisplayed(listener: { (applicationKey: ApplicationKey, formView: FormView): void; }) {
        this.applicationConfigFormDisplayedListeners.push(listener);
    }

    unApplicationConfigFormDisplayed(listener: { (applicationKey: ApplicationKey, formView: FormView): void; }) {
        this.applicationConfigFormDisplayedListeners =
            this.applicationConfigFormDisplayedListeners.filter((curr) => (curr !== listener));
    }

    private notifyApplicationConfigFormDisplayed(applicationKey: ApplicationKey, formView: FormView) {
        this.applicationConfigFormDisplayedListeners.forEach((listener) => listener(applicationKey, formView));
    }

    onBeforeOptionCreated(listener: () => void) {
        this.beforeOptionCreatedListeners.push(listener);
    }

    unBeforeOptionCreated(listener: () => void) {
        this.beforeOptionCreatedListeners = this.beforeOptionCreatedListeners.filter((curr) => {
            return listener !== curr;
        });
    }

    private notifyBeforeOptionCreated() {
        this.beforeOptionCreatedListeners.forEach((listener) => listener());
    }

    onAfterOptionCreated(listener: () => void) {
        this.afterOptionCreatedListeners.push(listener);
    }

    unAfterOptionCreated(listener: () => void) {
        this.afterOptionCreatedListeners = this.afterOptionCreatedListeners.filter((curr) => {
            return listener !== curr;
        });
    }

    private notifyAfterOptionCreated() {
        this.afterOptionCreatedListeners.forEach((listener) => listener());
    }

}
