import Option = api.ui.selector.Option;
import SelectedOption = api.ui.selector.combobox.SelectedOption;
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
    }
}

class ReportSelectedOptionView
    extends RepositoryViewer
    implements api.ui.selector.combobox.SelectedOptionView<Repository> {

    private option: Option<Repository>;

    constructor(option: Option<Repository>) {
        super('selected-option report-selected-option-view');
        this.setOption(option);
        this.appendRemoveButton();
    }

    setOption(option: api.ui.selector.Option<Repository>) {
        this.option = option;
        this.setObject(option.displayValue);
    }

    getOption(): api.ui.selector.Option<Repository> {
        return this.option;
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
