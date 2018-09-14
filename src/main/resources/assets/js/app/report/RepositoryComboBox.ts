import Option = api.ui.selector.Option;
import SelectedOption = api.ui.selector.combobox.SelectedOption;
import Dropdown = api.ui.selector.dropdown.Dropdown;
import DropdownConfig = api.ui.selector.dropdown.DropdownConfig;
import {RepositoryViewer} from './RepositoryViewer';
import {Repository} from './Repository';
import {RepositoryLoader} from './RepositoryLoader';

export class RepositoryComboBox
    extends api.ui.selector.combobox.RichComboBox<Repository> {

    constructor(value?: string) {
        let builder = new api.ui.selector.combobox.RichComboBoxBuilder<Repository>()
            .setComboBoxName('ReportSelector')
            .setIdentifierMethod('getId')
            .setLoader(new RepositoryLoader())
            .setValue(value)
            .setSelectedOptionsView(new ReportSelectedOptionsView())
            .setOptionDisplayValueViewer(new RepositoryViewer())
            .setDelayedInputValueChangedHandling(500);
        super(builder);
    }

    clearSelection(forceClear: boolean = false) {
        this.getLoader().search('');
        super.clearSelection(forceClear);
        (<ReportSelectedOptionView>this.getSelectedOptions()[0].getOptionView()).getBranch();
    }

    getSelectedBranches(): string[] {
        return this.getSelectedOptions().map(selectedOption => (<ReportSelectedOptionView>selectedOption.getOptionView()).getBranch());
    }
}

class ReportSelectedOptionView
    extends RepositoryViewer
    implements api.ui.selector.combobox.SelectedOptionView<Repository> {

    private option: Option<Repository>;

    private branchDropDown: Dropdown<string>;

    constructor(option: Option<Repository>) {
        super('selected-option report-selected-option-view');
        this.setOption(option);
        this.appendRemoveButton();
        this.appendChild(this.branchDropDown = this.createBranchesDropdown(option.displayValue));
    }

    setOption(option: api.ui.selector.Option<Repository>) {
        this.option = option;
        this.setObject(option.displayValue);
    }

    getOption(): api.ui.selector.Option<Repository> {
        return this.option;
    }

    getBranch(): string {
        return this.branchDropDown.getValue();
    }

    private createBranchesDropdown(repo: Repository): Dropdown<string> {
        const branchDropDown = new Dropdown<string>('branch', <DropdownConfig<string>>{});
        const masterBranch: string = 'master';

        repo.getBranches().forEach((branch: string) => {
            branchDropDown.addOption(<Option<string>>{value: branch, displayValue: branch});

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
    extends api.ui.selector.combobox.BaseSelectedOptionsView<Repository> {

    constructor() {
        super('report-selected-options-view');
    }

    createSelectedOption(option: Option<Repository>): SelectedOption<Repository> {
        let optionView = new ReportSelectedOptionView(option);
        return new api.ui.selector.combobox.SelectedOption<Repository>(optionView, this.count());
    }

}
