import {Application} from 'lib-admin-ui/application/Application';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {FormView} from 'lib-admin-ui/form/FormView';
import {Option} from 'lib-admin-ui/ui/selector/Option';
import {SelectedOption} from 'lib-admin-ui/ui/selector/combobox/SelectedOption';
import {BaseSelectedOptionsView} from 'lib-admin-ui/ui/selector/combobox/BaseSelectedOptionsView';
import {ApplicationConfigProvider} from 'lib-admin-ui/form/inputtype/appconfig/ApplicationConfigProvider';
import {AuthApplicationSelectedOptionView} from './AuthApplicationSelectedOptionView';

export class AuthApplicationSelectedOptionsView
    extends BaseSelectedOptionsView<Application> {

    private applicationConfigProvider: ApplicationConfigProvider;

    private applicationConfigFormDisplayedListeners: { (applicationKey: ApplicationKey, formView: FormView): void }[] = [];

    private beforeOptionCreatedListeners: { (): void }[] = [];

    private afterOptionCreatedListeners: { (optionView: AuthApplicationSelectedOptionView): void }[] = [];

    private items: AuthApplicationSelectedOptionView[] = [];

    constructor(applicationConfigProvider: ApplicationConfigProvider, readOnly: boolean) {
        super();
        this.applicationConfigProvider = applicationConfigProvider;
        this.setReadonly(readOnly);

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

        let applicationConfig = this.applicationConfigProvider.getConfig(option.getDisplayValue().getApplicationKey());
        let optionView = new AuthApplicationSelectedOptionView(option, applicationConfig, this.readonly);

        optionView.onApplicationConfigFormDisplayed((applicationKey: ApplicationKey) => {
            this.notifyApplicationConfigFormDisplayed(applicationKey, optionView.getFormView());
        });
        this.items.push(optionView);

        this.notifyAfterOptionCreated(optionView);
        return new SelectedOption<Application>(optionView, this.count());
    }

    removeOption(optionToRemove: Option<Application>, silent: boolean = false): void {
        this.items = this.items.filter(
            item => !item.getSiteConfig().getApplicationKey().equals(optionToRemove.getDisplayValue().getApplicationKey()));
        super.removeOption(optionToRemove, silent);
    }

    onApplicationConfigFormDisplayed(listener: { (applicationKey: ApplicationKey, formView: FormView): void; }): void {
        this.applicationConfigFormDisplayedListeners.push(listener);
    }

    unApplicationConfigFormDisplayed(listener: { (applicationKey: ApplicationKey, formView: FormView): void; }): void {
        this.applicationConfigFormDisplayedListeners =
            this.applicationConfigFormDisplayedListeners.filter((curr) => (curr !== listener));
    }

    private notifyApplicationConfigFormDisplayed(applicationKey: ApplicationKey, formView: FormView) {
        this.applicationConfigFormDisplayedListeners.forEach((listener) => listener(applicationKey, formView));
    }

    onBeforeOptionCreated(listener: () => void): void {
        this.beforeOptionCreatedListeners.push(listener);
    }

    unBeforeOptionCreated(listener: () => void): void {
        this.beforeOptionCreatedListeners = this.beforeOptionCreatedListeners.filter((curr) => {
            return listener !== curr;
        });
    }

    private notifyBeforeOptionCreated() {
        this.beforeOptionCreatedListeners.forEach((listener) => listener());
    }

    onAfterOptionCreated(listener: (optionView: AuthApplicationSelectedOptionView) => void): void {
        this.afterOptionCreatedListeners.push(listener);
    }

    unAfterOptionCreated(listener: (optionView: AuthApplicationSelectedOptionView) => void): void {
        this.afterOptionCreatedListeners = this.afterOptionCreatedListeners.filter((curr) => {
            return listener !== curr;
        });
    }

    private notifyAfterOptionCreated(optionView: AuthApplicationSelectedOptionView) {
        this.afterOptionCreatedListeners.forEach((listener) => listener(optionView));
    }

}
