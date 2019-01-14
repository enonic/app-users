import Option = api.ui.selector.Option;
import SelectedOption = api.ui.selector.combobox.SelectedOption;
import SelectedOptionEvent = api.ui.selector.combobox.SelectedOptionEvent;
import SelectedOptionView = api.ui.selector.combobox.SelectedOptionView;
import SelectedOptionsView = api.ui.selector.combobox.SelectedOptionsView;
import {IdProviderAccessControlEntryViewer} from './IdProviderAccessControlEntryViewer';
import {IdProviderAccessControlEntryView} from './IdProviderAccessControlEntryView';
import {IdProviderAccessControlListView} from './IdProviderAccessControlListView';
import {IdProviderAccessControlEntry} from '../access/IdProviderAccessControlEntry';
import {IdProviderAccessControlEntryLoader} from '../access/IdProviderAccessControlEntryLoader';

export class IdProviderAccessControlComboBox
    extends api.ui.selector.combobox.RichComboBox<IdProviderAccessControlEntry> {

    private aceSelectedOptionsView: IdProviderACESelectedOptionsView;

    constructor() {
        let aceSelectedOptionsView = new IdProviderACESelectedOptionsView();

        let builder = new api.ui.selector.combobox.RichComboBoxBuilder<IdProviderAccessControlEntry>().setMaximumOccurrences(
            0).setComboBoxName('principalSelector').setLoader(new IdProviderAccessControlEntryLoader()).setSelectedOptionsView(
            aceSelectedOptionsView).setOptionDisplayValueViewer(
            new IdProviderAccessControlEntryViewer()).setDelayedInputValueChangedHandling(500);

        super(builder);

        this.aceSelectedOptionsView = aceSelectedOptionsView;
    }

    onOptionValueChanged(listener: (item: IdProviderAccessControlEntry) => void) {
        this.aceSelectedOptionsView.onItemValueChanged(listener);
    }

    unItemValueChanged(listener: (item: IdProviderAccessControlEntry) => void) {
        this.aceSelectedOptionsView.unItemValueChanged(listener);
    }
}

class IdProviderACESelectedOptionView
    extends IdProviderAccessControlEntryView
    implements SelectedOptionView<IdProviderAccessControlEntry> {

    private option: Option<IdProviderAccessControlEntry>;

    constructor(option: Option<IdProviderAccessControlEntry>, readonly: boolean = false) {
        super(option.displayValue, readonly);
        this.option = option;
    }

    setOption(option: Option<IdProviderAccessControlEntry>) {
        this.option = option;
        this.setIdProviderAccessControlEntry(option.displayValue);
    }

    getOption(): Option<IdProviderAccessControlEntry> {
        return this.option;
    }

}

class IdProviderACESelectedOptionsView
    extends IdProviderAccessControlListView
    implements SelectedOptionsView<IdProviderAccessControlEntry> {

    private maximumOccurrences: number;
    private list: SelectedOption<IdProviderAccessControlEntry>[] = [];

    private selectedOptionRemovedListeners: { (removed: SelectedOptionEvent<IdProviderAccessControlEntry>): void; }[] = [];
    private selectedOptionAddedListeners: { (added: SelectedOptionEvent<IdProviderAccessControlEntry>): void; }[] = [];

    constructor(className?: string) {
        super(className);
    }

    setReadonly(readonly: boolean) {
        this.getSelectedOptions().forEach((option: SelectedOption<IdProviderAccessControlEntry>) => {
            option.getOptionView().setReadonly(readonly);
        });
    }

    setMaximumOccurrences(value: number) {
        this.maximumOccurrences = value;
    }

    getMaximumOccurrences(): number {
        return this.maximumOccurrences;
    }

    createSelectedOption(_option: Option<IdProviderAccessControlEntry>): SelectedOption<IdProviderAccessControlEntry> {
        throw new Error('Not supported, use createItemView instead');
    }

    createItemView(entry: IdProviderAccessControlEntry, readOnly: boolean): IdProviderACESelectedOptionView {

        let option = {
            displayValue: entry,
            value: this.getItemId(entry),
            readOnly: readOnly
        };
        let itemView = new IdProviderACESelectedOptionView(option, readOnly);
        itemView.onValueChanged((item: IdProviderAccessControlEntry) => {
            // update our selected options list with new values
            const selectedOption = this.getById(item.getPrincipal().getKey().toString());
            if (selectedOption) {
                selectedOption.getOption().displayValue = item;
            }
            this.notifyItemValueChanged(item);
        });
        const selected = new SelectedOption<IdProviderAccessControlEntry>(itemView, this.list.length);

        itemView.onRemoveClicked(() => this.removeOption(option, false));

        // keep track of selected options for SelectedOptionsView
        this.list.push(selected);
        return itemView;
    }

    addOption(option: Option<IdProviderAccessControlEntry>, silent: boolean = false, keyCode: number = -1): boolean {
        if (option.readOnly) {
            this.addItemReadOnly(option.displayValue);
        } else {
            this.addItem(option.displayValue);
        }
        if (!silent) {
            let selectedOption = this.getByOption(option);
            this.notifySelectedOptionAdded(new SelectedOptionEvent(selectedOption, keyCode));
        }
        return true;
    }

    updateOption(_option: Option<IdProviderAccessControlEntry>, _newOption: Option<IdProviderAccessControlEntry>) {
        //TODO
    }

    removeOption(optionToRemove: Option<IdProviderAccessControlEntry>, silent: boolean = false) {
        api.util.assertNotNull(optionToRemove, 'optionToRemove cannot be null');

        let selectedOption = this.getByOption(optionToRemove);
        api.util.assertNotNull(selectedOption, 'Did not find any selected option to remove from option: ' + optionToRemove.value);

        this.removeItem(optionToRemove.displayValue);

        this.list = this.list.filter((option: SelectedOption<IdProviderAccessControlEntry>) => {
            return option.getOption().value !== selectedOption.getOption().value;
        });

        // update item indexes to the right of removed item
        if (selectedOption.getIndex() < this.list.length) {
            for (let i: number = selectedOption.getIndex(); i < this.list.length; i++) {
                this.list[i].setIndex(i);
            }
        }

        if (!silent) {
            this.notifySelectedOptionRemoved(new SelectedOptionEvent(selectedOption));
        }
    }

    count(): number {
        return this.list.length;
    }

    getSelectedOptions(): SelectedOption<IdProviderAccessControlEntry>[] {
        return this.list;
    }

    getByIndex(index: number): SelectedOption<IdProviderAccessControlEntry> {
        return this.list[index];
    }

    getByOption(option: Option<IdProviderAccessControlEntry>): SelectedOption<IdProviderAccessControlEntry> {
        return this.getById(option.value);
    }

    getById(id: string): SelectedOption<IdProviderAccessControlEntry> {
        return this.list.filter((selectedOption: SelectedOption<IdProviderAccessControlEntry>) => {
            return selectedOption.getOption().value === id;
        })[0];
    }

    isSelected(option: Option<IdProviderAccessControlEntry>): boolean {
        return this.getByOption(option) != null;
    }

    maximumOccurrencesReached(): boolean {
        if (this.maximumOccurrences === 0) {
            return false;
        }
        return this.count() >= this.maximumOccurrences;
    }

    moveOccurrence(formIndex: number, toIndex: number) {
        api.util.ArrayHelper.moveElement(formIndex, toIndex, this.list);
        api.util.ArrayHelper.moveElement(formIndex, toIndex, this.getChildren());

        this.list.forEach((selectedOption: SelectedOption<IdProviderAccessControlEntry>,
                           index: number) => selectedOption.setIndex(index));
    }

    refreshSortable() {
        return;
    }

    onOptionDeselected(listener: { (removed: SelectedOptionEvent<IdProviderAccessControlEntry>): void; }) {
        this.selectedOptionRemovedListeners.push(listener);
    }

    unOptionDeselected(listener: { (removed: SelectedOptionEvent<IdProviderAccessControlEntry>): void; }) {
        this.selectedOptionRemovedListeners = this.selectedOptionRemovedListeners
            .filter(function (curr: { (removed: SelectedOptionEvent<IdProviderAccessControlEntry>): void; }) {
                return curr !== listener;
            });
    }

    onOptionSelected(listener: { (added: SelectedOptionEvent<IdProviderAccessControlEntry>): void; }) {
        this.selectedOptionAddedListeners.push(listener);
    }

    unOptionSelected(listener: { (added: SelectedOptionEvent<IdProviderAccessControlEntry>): void; }) {
        this.selectedOptionAddedListeners = this.selectedOptionAddedListeners
            .filter(function (curr: { (added: SelectedOptionEvent<IdProviderAccessControlEntry>): void; }) {
                return curr !== listener;
            });
    }

    onOptionMoved(_listener: { (moved: SelectedOption<IdProviderAccessControlEntry>): void; }) {
        // must be implemented by children
    }

    unOptionMoved(_listener: { (moved: SelectedOption<IdProviderAccessControlEntry>): void; }) {
        // must be implemented by children
    }

    private notifySelectedOptionRemoved(removed: SelectedOptionEvent<IdProviderAccessControlEntry>) {
        this.selectedOptionRemovedListeners.forEach((listener) => {
            listener(removed);
        });
    }

    private notifySelectedOptionAdded(added: SelectedOptionEvent<IdProviderAccessControlEntry>) {
        this.selectedOptionAddedListeners.forEach((listener) => {
            listener(added);
        });
    }

    setEditable(_editable: boolean) {
        throw new Error('Not in use');
    }

}
