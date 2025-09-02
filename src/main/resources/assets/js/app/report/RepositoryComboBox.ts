import {Option} from '@enonic/lib-admin-ui/ui/selector/Option';
import {SelectedOption} from '@enonic/lib-admin-ui/ui/selector/combobox/SelectedOption';
import {RepositoryViewer} from './RepositoryViewer';
import {Repository} from './Repository';
import {SelectedOptionView} from '@enonic/lib-admin-ui/ui/selector/combobox/SelectedOptionView';
import {BaseSelectedOptionsView} from '@enonic/lib-admin-ui/ui/selector/combobox/BaseSelectedOptionsView';
import {FilterableListBoxWrapperWithSelectedView} from '@enonic/lib-admin-ui/ui/selector/list/FilterableListBoxWrapperWithSelectedView';
import {ListBox} from '@enonic/lib-admin-ui/ui/selector/list/ListBox';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {FormInputEl} from '@enonic/lib-admin-ui/dom/FormInputEl';
import {ListRepositoriesRequest} from '../../graphql/repository/ListRepositoriesRequest';
import Q from 'q';
import {Dropdown} from '@enonic/lib-admin-ui/ui/Dropdown';

export class RepositoryComboBox
    extends FilterableListBoxWrapperWithSelectedView<Repository> {

    private static loadPromise: Q.Promise<Repository[]>;

    constructor() {
        super(new RepositoryList(), {
            maxSelected: 0,
            className: 'repository-combobox',
            filter: (item, searchString) => item.getName().toString().toLowerCase().indexOf(searchString.toLowerCase()) !== -1,
            selectedOptionsView: new ReportSelectedOptionsView(),
            checkboxPosition: 'right',
        });

        this.load();
    }

    private load(): void {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
       RepositoryComboBox.loadPromise = RepositoryComboBox.loadPromise || new ListRepositoriesRequest().sendAndParse();

       RepositoryComboBox.loadPromise.then((repositories: Repository[]) => {
           this.listBox.setItems(repositories);
       });
    }

    createSelectedOption(item: Repository): Option<Repository> {
        return Option.create<Repository>()
            .setValue(item.getName())
            .setDisplayValue(item)
            .build();
    }

    getSelectedBranches(): string[] {
        return this.getSelectedOptions().map(selectedOption => (selectedOption.getOptionView() as ReportSelectedOptionView).getBranch());
    }
}

export class RepositoryList
    extends ListBox<Repository> {

    protected createItemView(item: Repository, readOnly: boolean): Element {
        const viewer = new RepositoryViewer();
        viewer.setObject(item);
        return viewer;
    }

    protected getItemId(item: Repository): string {
        return item.getName();
    }

}

class ReportSelectedOptionView
    extends RepositoryViewer
    implements SelectedOptionView<Repository> {

    private option: Option<Repository>;

    private branchDropDown: Dropdown;

    constructor(option: Option<Repository>) {
        super('selected-option report-selected-option-view');
        this.setOption(option);
        this.appendRemoveButton();
        this.appendChild(this.branchDropDown = this.createBranchesDropdown(option.getDisplayValue()));
    }

    setOption(option: Option<Repository>) {
        this.option = option;
        this.setObject(option.getDisplayValue());
    }

    getOption(): Option<Repository> {
        return this.option;
    }

    getBranch(): string {
        return this.branchDropDown.getValue();
    }

    private createBranchesDropdown(repo: Repository): Dropdown {
        const branchDropDown = new Dropdown('branch');
        branchDropDown.addClass('branch-dropdown');
        const masterBranch: string = 'master';

        repo.getBranches().forEach((branch: string) => {
            branchDropDown.addOption(branch, branch);

            if (branch === masterBranch) {
                branchDropDown.setValue(masterBranch);
            }
        });

        if (!branchDropDown.getValue() && repo.getBranches().length > 0) {
            branchDropDown.setValue(repo.getBranches()[0]);
        }

        return branchDropDown;
    }
}

class ReportSelectedOptionsView
    extends BaseSelectedOptionsView<Repository> {

    constructor() {
        super('report-selected-options-view');
    }

    createSelectedOption(option: Option<Repository>): SelectedOption<Repository> {
        let optionView = new ReportSelectedOptionView(option);
        return new SelectedOption<Repository>(optionView, this.count());
    }
}

export class RepositoryComboBoxWrapper extends FormInputEl {

    private readonly selector: RepositoryComboBox;

    constructor(selector: RepositoryComboBox) {
        super('div', 'locale-selector-wrapper');

        this.selector = selector;
        this.appendChild(this.selector);
    }

    getComboBox(): RepositoryComboBox {
        return this.selector;
    }

    getValue(): string {
        return this.selector.getSelectedOptions().map((item: SelectedOption<Repository>) => item.getOption().getValue()).join(';') || null;
    }
}
