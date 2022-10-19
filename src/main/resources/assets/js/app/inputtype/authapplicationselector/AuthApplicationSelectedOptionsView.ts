import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import {FormView} from '@enonic/lib-admin-ui/form/FormView';
import {Option} from '@enonic/lib-admin-ui/ui/selector/Option';
import {SelectedOption} from '@enonic/lib-admin-ui/ui/selector/combobox/SelectedOption';
import {BaseSelectedOptionsView} from '@enonic/lib-admin-ui/ui/selector/combobox/BaseSelectedOptionsView';
import {ApplicationConfigProvider} from '@enonic/lib-admin-ui/form/inputtype/appconfig/ApplicationConfigProvider';
import {AuthApplicationSelectedOptionView} from './AuthApplicationSelectedOptionView';
import {ApplicationConfig} from '@enonic/lib-admin-ui/application/ApplicationConfig';

export class AuthApplicationSelectedOptionsView
    extends BaseSelectedOptionsView<Application> {

    private applicationConfigProvider: ApplicationConfigProvider;

    private applicationConfigFormDisplayedListeners: { (applicationKey: ApplicationKey, formView: FormView): void }[] = [];

    private beforeOptionCreatedListeners: { (): void }[] = [];

    private afterOptionCreatedListeners: { (optionView: AuthApplicationSelectedOptionView): void }[] = [];

    private items: AuthApplicationSelectedOptionView[] = [];

    constructor(applicationConfigProvider: ApplicationConfigProvider, readOnly: boolean) {
        super();

        this.setApplicationConfigProvider(applicationConfigProvider);
        this.setReadonly(readOnly);
        this.setOccurrencesSortable(true);
    }

    createSelectedOption(option: Option<Application>): SelectedOption<Application> {
        this.notifyBeforeOptionCreated();

        const applicationConfig: ApplicationConfig = this.applicationConfigProvider.getConfig(option.getDisplayValue().getApplicationKey());
        const optionView: AuthApplicationSelectedOptionView =
            new AuthApplicationSelectedOptionView(option, applicationConfig, this.readonly);

        optionView.onApplicationConfigFormDisplayed((applicationKey: ApplicationKey) => {
            this.notifyApplicationConfigFormDisplayed(applicationKey, optionView.getFormView());
        });

        this.items.push(optionView);

        this.notifyAfterOptionCreated(optionView);
        return new SelectedOption<Application>(optionView, this.count());
    }

    setApplicationConfigProvider(value: ApplicationConfigProvider): void {
        this.applicationConfigProvider = value;

        this.applicationConfigProvider.onPropertyChanged(() => {
            this.items.forEach((optionView: AuthApplicationSelectedOptionView) => {
                const newConfig: ApplicationConfig =
                    this.applicationConfigProvider.getConfig(optionView.getSiteConfig().getApplicationKey());

                if (newConfig) {
                    optionView.setSiteConfig(newConfig);
                }
            });
        });
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
