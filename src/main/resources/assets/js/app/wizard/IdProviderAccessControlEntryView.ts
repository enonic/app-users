import {Principal} from 'lib-admin-ui/security/Principal';
import {ValueChangedEvent} from 'lib-admin-ui/ValueChangedEvent';
import {IdProviderAccessSelector} from './IdProviderAccessSelector';
import {IdProviderAccessControlEntry} from '../access/IdProviderAccessControlEntry';
import {PrincipalContainerSelectedEntryView} from 'lib-admin-ui/ui/security/PrincipalContainerSelectedEntryView';

export class IdProviderAccessControlEntryView
    extends PrincipalContainerSelectedEntryView<IdProviderAccessControlEntry> {

    private accessSelector: IdProviderAccessSelector;

    public static debug: boolean = false;

    constructor(ace: IdProviderAccessControlEntry, readonly: boolean = false) {
        super(ace, readonly);
    }

    setEditable(editable: boolean): void {
        super.setEditable(editable);

        this.toggleClass('readonly', !editable);
        if (this.accessSelector) {
            this.accessSelector.setEnabled(editable);
        }
    }

    public setItem(ace: IdProviderAccessControlEntry): void {
        super.setItem(ace);

        let principal: Principal = Principal.create().setKey(ace.getPrincipal().getKey()).setModifiedTime(
            ace.getPrincipal().getModifiedTime()).setDisplayName(
            ace.getPrincipal().getDisplayName()).build();
        this.setObject(principal);

        this.doLayout(principal);
    }

    public getItem(): IdProviderAccessControlEntry {
        return new IdProviderAccessControlEntry(this.item.getPrincipal(), this.item.getAccess());
    }

    doLayout(object: Principal): void {
        super.doLayout(object);

        if (IdProviderAccessControlEntryView.debug) {
            console.debug('IdProviderAccessControlEntryView.doLayout');
        }

        // permissions will be set on access selector value change

        if (!this.accessSelector) {
            this.accessSelector = new IdProviderAccessSelector();
            this.accessSelector.setEnabled(this.isEditable());
            this.accessSelector.onValueChanged((event: ValueChangedEvent) => {
                this.item.setAccess(event.getNewValue());
                this.notifyValueChanged(this.getItem());
            });
            this.appendChild(this.accessSelector);
        }
        this.accessSelector.setValue(this.item.getAccess(), true);

        this.appendRemoveButton();
    }
}
