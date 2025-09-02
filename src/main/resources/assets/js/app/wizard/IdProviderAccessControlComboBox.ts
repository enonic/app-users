import {Option} from '@enonic/lib-admin-ui/ui/selector/Option';
import {IdProviderAccessControlEntryView} from './IdProviderAccessControlEntryView';
import {IdProviderAccessControlEntry} from '../access/IdProviderAccessControlEntry';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalContainerSelectedOptionsView} from '@enonic/lib-admin-ui/ui/security/PrincipalContainerSelectedOptionsView';
import {PrincipalLoader} from '../principal/PrincipalLoader';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {
    FilterableListBoxWrapperWithSelectedView,
    ListBoxInputOptions
} from '@enonic/lib-admin-ui/ui/selector/list/FilterableListBoxWrapperWithSelectedView';
import {UrlHelper} from '../../util/UrlHelper';
import {LazyListBox} from '@enonic/lib-admin-ui/ui/selector/list/LazyListBox';
import {PrincipalContainerViewer} from '@enonic/lib-admin-ui/ui/security/PrincipalContainerViewer';
import {LoadedDataEvent} from '@enonic/lib-admin-ui/util/loader/event/LoadedDataEvent';
import Q from 'q';
import {AppHelper} from '@enonic/lib-admin-ui/util/AppHelper';
import {ValueChangedEvent} from '@enonic/lib-admin-ui/ValueChangedEvent';
import {StringHelper} from '@enonic/lib-admin-ui/util/StringHelper';
import {FormInputEl} from '@enonic/lib-admin-ui/dom/FormInputEl';
import {SelectedOption} from '@enonic/lib-admin-ui/ui/selector/combobox/SelectedOption';

interface IdProviderAccessControlComboBoxOptions extends ListBoxInputOptions<IdProviderAccessControlEntry> {
    loader: PrincipalLoader;
}

export class IdProviderAccessControlComboBox
    extends FilterableListBoxWrapperWithSelectedView<IdProviderAccessControlEntry> {

    protected options: IdProviderAccessControlComboBoxOptions;

    constructor() {
        const loader = new PrincipalLoader(UrlHelper.getRestUri(''));

        super(new IdProviderAccessListBox(loader), {
            maxSelected: 0,
            selectedOptionsView: new IdProviderACESelectedOptionsView(),
            className: 'id-provider-access-control-combobox',
            loader: loader
        } as IdProviderAccessControlComboBoxOptions);
    }

    protected initListeners(): void {
        super.initListeners();

        this.options.loader.onLoadedData((event: LoadedDataEvent<Principal>) => {
            if (event.isPostLoad()) {
                this.listBox.addItems(event.getData().map(p => new IdProviderAccessControlEntry(p)));
            } else {
                this.listBox.setItems(event.getData().map(p => new IdProviderAccessControlEntry(p)));
            }
            return Q.resolve(null);
        });

        this.listBox.whenShown(() => {
            // if not empty then search will be performed after finished typing
            if (StringHelper.isBlank(this.optionFilterInput.getValue())) {
                this.search(this.optionFilterInput.getValue());
            }
        });

        let searchValue = '';

        const debouncedSearch = AppHelper.debounce(() => {
            this.search(searchValue);
        }, 300);

        this.optionFilterInput.onValueChanged((event: ValueChangedEvent) => {
            searchValue = event.getNewValue();
            debouncedSearch();
        });
    }

    protected search(value?: string): void {
        this.options.loader.search(value).catch(DefaultErrorHandler.handle);
    }

    createSelectedOption(item: IdProviderAccessControlEntry): Option<IdProviderAccessControlEntry> {
        return Option.create<IdProviderAccessControlEntry>()
            .setValue(item.getPrincipal().getKey().toString())
            .setDisplayValue(item)
            .build();
    }

}

class IdProviderACESelectedOptionsView
    extends PrincipalContainerSelectedOptionsView<IdProviderAccessControlEntry> {

    constructor() {
        super('idp-ace-selected-options-view');
    }

    protected createSelectedEntryView(option: Option<IdProviderAccessControlEntry>): IdProviderAccessControlEntryView {
        return new IdProviderAccessControlEntryView(option.getDisplayValue(), option.isReadOnly());
    }

    createSelectedOption(option: Option<IdProviderAccessControlEntry>): SelectedOption<IdProviderAccessControlEntry> {
        const selectedOption = super.createSelectedOption(option);

        selectedOption.getOptionView().addClass('idp-ace-selected-option-view');

        return selectedOption;
    }

}

class IdProviderAccessListBox
    extends LazyListBox<IdProviderAccessControlEntry> {

    private readonly loader: PrincipalLoader;

    constructor(loader: PrincipalLoader) {
        super('principals-list-box');

        this.loader = loader;
    }

    protected createItemView(item: IdProviderAccessControlEntry, readOnly: boolean): PrincipalContainerViewer<IdProviderAccessControlEntry> {
        const viewer = new PrincipalContainerViewer<IdProviderAccessControlEntry>();
        viewer.setObject(item);
        return viewer;
    }

    protected getItemId(item: IdProviderAccessControlEntry): string {
        return item.getPrincipal().getKey().toString();
    }

    protected handleLazyLoad(): void {
        super.handleLazyLoad();

        if (this.loader.isPartiallyLoaded()) {
            this.loader.load(true);
        }
    }
}

export class IdProviderAccessControlComboBoxWrapper extends FormInputEl {

    private readonly selector: IdProviderAccessControlComboBox;

    constructor(selector: IdProviderAccessControlComboBox) {
        super('div', 'locale-selector-wrapper');

        this.selector = selector;
        this.appendChild(this.selector);
    }

    getComboBox(): IdProviderAccessControlComboBox {
        return this.selector;
    }

    getValue(): string {
        return this.selector.getSelectedOptions().length > 0 ? 'mock' : '';
    }
}
