import {IdProviderAccessControlEntryView} from './IdProviderAccessControlEntryView';
import {IdProviderAccessControlEntry} from '../access/IdProviderAccessControlEntry';
import {ListBox} from 'lib-admin-ui/ui/selector/list/ListBox';

export class IdProviderAccessControlListView
    extends ListBox<IdProviderAccessControlEntry> {

    private itemValueChangedListeners: { (item: IdProviderAccessControlEntry): void }[] = [];
    private itemsEditable: boolean = true;

    constructor(className?: string) {
        super('selected-options access-control-list' + (className ? ' ' + className : ''));
    }

    createItemView(entry: IdProviderAccessControlEntry, readOnly: boolean): IdProviderAccessControlEntryView {
        let itemView = new IdProviderAccessControlEntryView(entry, readOnly);
        itemView.onRemoveClicked(() => {
            this.removeItem(entry);
        });
        itemView.onValueChanged((item: IdProviderAccessControlEntry) => {
            this.notifyItemValueChanged(item);
        });

        return itemView;
    }

    getItemId(item: IdProviderAccessControlEntry): string {
        return item.getPrincipal().getKey().toString();
    }

    onItemValueChanged(listener: (item: IdProviderAccessControlEntry) => void) {
        this.itemValueChangedListeners.push(listener);
    }

    unItemValueChanged(listener: (item: IdProviderAccessControlEntry) => void) {
        this.itemValueChangedListeners = this.itemValueChangedListeners.filter((curr) => {
            return curr !== listener;
        });
    }

    notifyItemValueChanged(item: IdProviderAccessControlEntry) {
        this.itemValueChangedListeners.forEach((listener) => {
            listener(item);
        });
    }

    setItemsEditable(editable: boolean): IdProviderAccessControlListView {
        if (this.itemsEditable !== editable) {
            this.itemsEditable = editable;
            this.refreshList();
        }
        return this;
    }

    isItemsEditable(): boolean {
        return this.itemsEditable;
    }

}
