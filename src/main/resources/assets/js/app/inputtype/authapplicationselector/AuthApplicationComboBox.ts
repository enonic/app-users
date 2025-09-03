import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import {ApplicationViewer} from '@enonic/lib-admin-ui/application/ApplicationViewer';
import {FormView} from '@enonic/lib-admin-ui/form/FormView';
import {SelectedOption} from '@enonic/lib-admin-ui/ui/selector/combobox/SelectedOption';
import {AuthApplicationSelectedOptionsView} from './AuthApplicationSelectedOptionsView';
import {AuthApplicationSelectedOptionView} from './AuthApplicationSelectedOptionView';
import {FilterableListBoxWrapperWithSelectedView} from '@enonic/lib-admin-ui/ui/selector/list/FilterableListBoxWrapperWithSelectedView';
import {ListBox} from '@enonic/lib-admin-ui/ui/selector/list/ListBox';
import {ApplicationConfigProvider} from '@enonic/lib-admin-ui/form/inputtype/appconfig/ApplicationConfigProvider';
import {FormInputEl} from '@enonic/lib-admin-ui/dom/FormInputEl';
import {ListIdProviderApplicationsRequest} from '../../resource/ListIdProviderApplicationsRequest';
import Q from 'q';
import {Option} from '@enonic/lib-admin-ui/ui/selector/Option';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';

export class AuthApplicationComboBox
    extends FilterableListBoxWrapperWithSelectedView<Application> {

    protected selectedOptionsView: AuthApplicationSelectedOptionsView;

    private loadedPromise: Q.Promise<Application[]>;

    constructor(applicationConfigProvider: ApplicationConfigProvider, readOnly?: boolean) {
        super(new AuthApplicationList(), {
            maxSelected: 1,
            className: 'auth-application-combobox',
            filter: (item, searchString) => item.getDisplayName().toString().toLowerCase().indexOf(searchString.toLowerCase()) !== -1,
            selectedOptionsView: new AuthApplicationSelectedOptionsView(applicationConfigProvider, readOnly),
        });

        this.load();
    }

    private load(): void {
        this.loadedPromise = new ListIdProviderApplicationsRequest().sendAndParse();

        this.loadedPromise.then((applications: Application[]) => {
            this.listBox.setItems(applications);
        }).catch(DefaultErrorHandler.handle);
    }

    createSelectedOption(item: Application): Option<Application> {
        return Option.create<Application>()
            .setValue(item.getApplicationKey().toString())
            .setDisplayValue(item)
            .build();
    }

    getSelectedOptionViews(): AuthApplicationSelectedOptionView[] {
        let views: AuthApplicationSelectedOptionView[] = [];
        this.getSelectedOptions().forEach((selectedOption: SelectedOption<Application>) => {
            views.push(selectedOption.getOptionView() as AuthApplicationSelectedOptionView);
        });
        return views;
    }

    preSelectApplication(applicationKey: ApplicationKey): void {
        if (!applicationKey) {
            return;
        }

        this.loadedPromise.then(() => {
            const item = this.getItemById(applicationKey.getName());

            if (item) {
                this.select(item);
            }
        });
    }

    onSiteConfigFormDisplayed(listener: { (applicationKey: ApplicationKey, formView: FormView) }): void {
        this.selectedOptionsView.onApplicationConfigFormDisplayed(listener);
    }

    unSiteConfigFormDisplayed(listener: { (applicationKey: ApplicationKey, formView: FormView) }): void {
        this.selectedOptionsView.unApplicationConfigFormDisplayed(listener);
    }

    onBeforeOptionCreated(listener: () => void): void {
        this.selectedOptionsView.onBeforeOptionCreated(listener);
    }

    unBeforeOptionCreated(listener: () => void): void {
        this.selectedOptionsView.unBeforeOptionCreated(listener);
    }

    onAfterOptionCreated(listener: () => void): void {
        this.selectedOptionsView.onAfterOptionCreated(listener);
    }

    unAfterOptionCreated(listener: () => void): void {
        this.selectedOptionsView.unAfterOptionCreated(listener);
    }
}

class AuthApplicationList
    extends ListBox<Application> {

    protected createItemView(item: Application, readOnly: boolean): ApplicationViewer {
        const viewer = new ApplicationViewer();
        viewer.setObject(item);
        return viewer;
    }

    protected getItemId(item: Application): string {
        return item.getId();
    }
}

export class AuthApplicationComboBoxWrapper extends FormInputEl {

    private readonly selector: AuthApplicationComboBox;

    constructor(selector: AuthApplicationComboBox) {
        super('div', 'locale-selector-wrapper');

        this.selector = selector;
        this.appendChild(this.selector);
    }

    getComboBox(): AuthApplicationComboBox {
        return this.selector;
    }

    getValue(): string {
        return this.selector.getSelectedOptions().map((item: SelectedOption<Application>) => item.getOption().getValue()).join(';') || null;
    }
}
