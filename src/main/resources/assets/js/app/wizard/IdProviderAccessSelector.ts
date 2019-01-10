import TabMenuItemBuilder = api.ui.tab.TabMenuItemBuilder;
import {IdProviderAccess} from '../access/IdProviderAccess';

interface IdProviderAccessSelectorOption {
    value: IdProviderAccess;
    name: string;
}

export class IdProviderAccessSelector
    extends api.ui.tab.TabMenu {

    private static OPTIONS: IdProviderAccessSelectorOption[] = [
        {value: IdProviderAccess.READ, name: 'Read'},
        {value: IdProviderAccess.CREATE_USERS, name: 'Create Users'},
        {value: IdProviderAccess.WRITE_USERS, name: 'Write Users'},
        {value: IdProviderAccess.ID_PROVIDER_MANAGER, name: 'User Store Manager'},
        {value: IdProviderAccess.ADMINISTRATOR, name: 'Administrator'}
    ];

    private value: IdProviderAccess;
    private valueChangedListeners: { (event: api.ValueChangedEvent): void }[] = [];

    constructor() {
        super('access-selector');

        IdProviderAccessSelector.OPTIONS.forEach((option: IdProviderAccessSelectorOption) => {
            let menuItem = (<TabMenuItemBuilder>new TabMenuItemBuilder().setLabel(option.name)).build();
            this.addNavigationItem(menuItem);
        });

        this.onNavigationItemSelected((event: api.ui.NavigatorEvent) => {
            let item: api.ui.tab.TabMenuItem = <api.ui.tab.TabMenuItem> event.getItem();
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
                this.notifyValueChanged(new api.ValueChangedEvent(IdProviderAccess[this.value], IdProviderAccess[value]));
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

    onValueChanged(listener: (event: api.ValueChangedEvent) => void) {
        this.valueChangedListeners.push(listener);
    }

    unValueChanged(listener: (event: api.ValueChangedEvent) => void) {
        this.valueChangedListeners = this.valueChangedListeners.filter((curr) => {
            return curr !== listener;
        });
    }

    private notifyValueChanged(event: api.ValueChangedEvent) {
        this.valueChangedListeners.forEach((listener) => {
            listener(event);
        });
    }

}
