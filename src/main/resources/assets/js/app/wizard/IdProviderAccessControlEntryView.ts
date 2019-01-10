import Principal = api.security.Principal;
import ValueChangedEvent = api.ValueChangedEvent;
import {IdProviderAccessSelector} from './IdProviderAccessSelector';
import {IdProviderAccessControlEntry} from '../access/IdProviderAccessControlEntry';
import {IdProviderAccess} from '../access/IdProviderAccess';

export class IdProviderAccessControlEntryView
    extends api.ui.security.PrincipalViewer {

    private ace: IdProviderAccessControlEntry;

    private accessSelector: IdProviderAccessSelector;

    private valueChangedListeners: { (item: IdProviderAccessControlEntry): void }[] = [];

    public static debug: boolean = false;

    constructor(ace: IdProviderAccessControlEntry, readonly: boolean = false) {
        super('selected-option userstore-access-control-entry');

        this.ace = ace;
        this.setEditable(!readonly);

        if (isNaN(this.ace.getAccess())) {
            this.ace.setAccess(IdProviderAccess[IdProviderAccess.CREATE_USERS]);
        }

        this.setIdProviderAccessControlEntry(this.ace);

    }

    getValueChangedListeners(): { (item: IdProviderAccessControlEntry): void }[] {
        return this.valueChangedListeners;
    }

    setEditable(editable: boolean) {
        super.setEditable(editable);

        this.toggleClass('readonly', !editable);
        if (this.accessSelector) {
            this.accessSelector.setEnabled(editable);
        }
    }

    onValueChanged(listener: (item: IdProviderAccessControlEntry) => void) {
        this.valueChangedListeners.push(listener);
    }

    unValueChanged(listener: (item: IdProviderAccessControlEntry) => void) {
        this.valueChangedListeners = this.valueChangedListeners.filter((curr) => {
            return curr !== listener;
        });
    }

    notifyValueChanged(item: IdProviderAccessControlEntry) {
        this.valueChangedListeners.forEach((listener) => {
            listener(item);
        });
    }

    public setIdProviderAccessControlEntry(ace: IdProviderAccessControlEntry) {
        this.ace = ace;

        let principal: Principal = <Principal>Principal.create().setKey(ace.getPrincipal().getKey()).setModifiedTime(
            ace.getPrincipal().getModifiedTime()).setDisplayName(
            ace.getPrincipal().getDisplayName()).build();
        this.setObject(principal);

        this.doLayout(principal);
    }

    public getIdProviderAccessControlEntry(): IdProviderAccessControlEntry {
        return new IdProviderAccessControlEntry(this.ace.getPrincipal(), this.ace.getAccess());
    }

    doLayout(object: Principal) {
        super.doLayout(object);

        if (IdProviderAccessControlEntryView.debug) {
            console.debug('IdProviderAccessControlEntryView.doLayout');
        }

        // permissions will be set on access selector value change

        if (!this.accessSelector) {
            this.accessSelector = new IdProviderAccessSelector();
            this.accessSelector.setEnabled(this.isEditable());
            this.accessSelector.onValueChanged((event: ValueChangedEvent) => {
                this.ace.setAccess(event.getNewValue());
            });
            this.appendChild(this.accessSelector);
        }
        this.accessSelector.setValue(this.ace.getAccess(), true);

        this.appendRemoveButton();
    }
}
