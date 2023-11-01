import {Option} from '@enonic/lib-admin-ui/ui/selector/Option';
import {SelectedOption} from '@enonic/lib-admin-ui/ui/selector/combobox/SelectedOption';
import {Dropdown, DropdownConfig} from '@enonic/lib-admin-ui/ui/selector/dropdown/Dropdown';
import {RepositoryViewer} from './RepositoryViewer';
import {Repository} from './Repository';
import {RepositoryLoader} from './RepositoryLoader';
import {RichComboBox, RichComboBoxBuilder} from '@enonic/lib-admin-ui/ui/selector/combobox/RichComboBox';
import {SelectedOptionView} from '@enonic/lib-admin-ui/ui/selector/combobox/SelectedOptionView';
import {BaseSelectedOptionsView} from '@enonic/lib-admin-ui/ui/selector/combobox/BaseSelectedOptionsView';
import {Viewer} from '@enonic/lib-admin-ui/ui/Viewer';
import {SelectedOptionsView} from '@enonic/lib-admin-ui/ui/selector/combobox/SelectedOptionsView';

export class RepositoryComboBox
    extends RichComboBox<Repository> {

    constructor(builder: RepositoryComboBoxBuilder = new RepositoryComboBoxBuilder()) {
        super(builder);
    }

    clearSelection(forceClear: boolean = false): void {
        this.getLoader().search('');
        super.clearSelection(forceClear);
        (this.getSelectedOptions()[0].getOptionView() as ReportSelectedOptionView).getBranch();
    }

    getSelectedBranches(): string[] {
        return this.getSelectedOptions().map(selectedOption => (selectedOption.getOptionView() as ReportSelectedOptionView).getBranch());
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

    private createBranchesDropdown(repo: Repository): Dropdown<string> {
        const branchDropDown = new Dropdown<string>('branch', {} as DropdownConfig<string>);
        const masterBranch: string = 'master';

        repo.getBranches().forEach((branch: string) => {
            branchDropDown.addOption(Option.create<string>()
                .setValue(branch)
                .setDisplayValue(branch)
                .build());

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

export class RepositoryComboBoxBuilder
    extends RichComboBoxBuilder<Repository> {

    comboBoxName: string = 'ReportSelector';

    loader: RepositoryLoader = new RepositoryLoader();

    optionDisplayValueViewer: Viewer<Repository> = new RepositoryViewer();

    delayedInputValueChangedHandling: number = 500;

    selectedOptionsView: SelectedOptionsView<Repository> = new ReportSelectedOptionsView();
}
