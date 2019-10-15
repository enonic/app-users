import {IdProviderAccess} from '../access/IdProviderAccess';
import {TabMenu} from 'lib-admin-ui/ui/tab/TabMenu';
import {ValueChangedEvent} from 'lib-admin-ui/ValueChangedEvent';
import {TabMenuItem, TabMenuItemBuilder} from 'lib-admin-ui/ui/tab/TabMenuItem';
import {NavigatorEvent} from 'lib-admin-ui/ui/NavigatorEvent';

interface IdProviderAccessSelectorOption {
    value: IdProviderAccess;
    name: string;
}

export class IdProviderAccessSelector
    extends TabMenu {

    private static OPTIONS: IdProviderAccessSelectorOption[] = [
        {value: IdProviderAccess.READ, name: 'Read'},
        {value: IdProviderAccess.CREATE_USERS, name: 'Create Users'},
        {value: IdProviderAccess.WRITE_USERS, name: 'Write Users'},
        {value: IdProviderAccess.ID_PROVIDER_MANAGER, name: 'Id Provider Manager'},
        {value: IdProviderAccess.ADMINISTRATOR, name: 'Administrator'}
    ];

    private value: IdProviderAccess;
    private valueChangedListeners: { (event: ValueChangedEvent): void }[] = [];

    constructor() {
        super('access-selector');

        IdProviderAccessSelector.OPTIONS.forEach((option: IdProviderAccessSelectorOption) => {
            let menuItem = (<TabMenuItemBuilder>new TabMenuItemBuilder().setLabel(option.name)).build();
            this.addNavigationItem(menuItem);
        });

        this.onNavigationItemSelected((event: NavigatorEvent) => {
            let item: TabMenuItem = <TabMenuItem> event.getItem();
            this.setValue(IdProviderAccessSelector.OPTIONS[item.getIndex()].value);
        });

    }

    getValue(): IdProviderAccess {
        return this.value;
    }

    setValue(value: IdProviderAccess, silent?: boolean): IdProviderAccessSelector {
        let option = this.findOptionByValue(value);
        if (option) {
            this.selectNavigationItem(IdProviderAccessSelector.OPTIONS.indexOf(option));
            if (!silent) {
                this.notifyValueChanged(new ValueChangedEvent(IdProviderAccess[this.value], IdProviderAccess[value]));
            }
            this.value = value;
        }
        return this;
    }

    private findOptionByValue(value: IdProviderAccess): IdProviderAccessSelectorOption {
        for (let i = 0; i < IdProviderAccessSelector.OPTIONS.length; i++) {
            let option = IdProviderAccessSelector.OPTIONS[i];
            if (option.value === value) {
                return option;
            }
        }
        return undefined;
    }

    onValueChanged(listener: (event: ValueChangedEvent) => void) {
        this.valueChangedListeners.push(listener);
    }

    unValueChanged(listener: (event: ValueChangedEvent) => void) {
        this.valueChangedListeners = this.valueChangedListeners.filter((curr) => {
            return curr !== listener;
        });
    }

    private notifyValueChanged(event: ValueChangedEvent) {
        this.valueChangedListeners.forEach((listener) => {
            listener(event);
        });
    }

}
