import {Option} from 'lib-admin-ui/ui/selector/Option';
import {SelectedOption} from 'lib-admin-ui/ui/selector/combobox/SelectedOption';
import {Dropdown, DropdownConfig} from 'lib-admin-ui/ui/selector/dropdown/Dropdown';
import {RepositoryViewer} from './RepositoryViewer';
import {Repository} from './Repository';
import {RepositoryLoader} from './RepositoryLoader';
import {RichComboBox, RichComboBoxBuilder} from 'lib-admin-ui/ui/selector/combobox/RichComboBox';
import {SelectedOptionView} from 'lib-admin-ui/ui/selector/combobox/SelectedOptionView';
import {BaseSelectedOptionsView} from 'lib-admin-ui/ui/selector/combobox/BaseSelectedOptionsView';

export class RepositoryComboBox
    extends RichComboBox<Repository> {

    constructor(value?: string) {
        let builder = new RichComboBoxBuilder<Repository>()
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
    implements SelectedOptionView<Repository> {

    private option: Option<Repository>;

    private branchDropDown: Dropdown<string>;

    constructor(option: Option<Repository>) {
        super('selected-option report-selected-option-view');
        this.setOption(option);
        this.appendRemoveButton();
        this.appendChild(this.branchDropDown = this.createBranchesDropdown(option.displayValue));
    }

    setOption(option: Option<Repository>) {
        this.option = option;
        this.setObject(option.displayValue);
    }

    getOption(): Option<Repository> {
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
    extends BaseSelectedOptionsView<Repository> {

    constructor() {
        super('report-selected-options-view');
    }

    createSelectedOption(option: Option<Repository>): SelectedOption<Repository> {
        let optionView = new ReportSelectedOptionView(option);
        return new SelectedOption<Repository>(optionView, this.count());
    }

}
