import {Option} from 'lib-admin-ui/ui/selector/Option';
import {IdProviderAccessControlEntryView} from './IdProviderAccessControlEntryView';
import {IdProviderAccessControlEntry} from '../access/IdProviderAccessControlEntry';
import {PrincipalContainerCombobox, PrincipalContainerComboboxBuilder} from 'lib-admin-ui/ui/security/PrincipalContainerCombobox';
import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalContainerSelectedOptionsView} from 'lib-admin-ui/ui/security/PrincipalContainerSelectedOptionsView';
import {UsersPrincipalLoader} from '../principal/UsersPrincipalLoader';

export class IdProviderAccessControlComboBox
    extends PrincipalContainerCombobox<IdProviderAccessControlEntry> {

    constructor(builder: IdProviderAccessControlComboBoxBuilder) {
        super(builder);
    }

    protected loadedItemToDisplayValue(value: Principal): IdProviderAccessControlEntry {
        return new IdProviderAccessControlEntry(value);
    }
}

class IdProviderACESelectedOptionsView
    extends PrincipalContainerSelectedOptionsView<IdProviderAccessControlEntry> {

    protected createSelectedEntryView(option: Option<IdProviderAccessControlEntry>): IdProviderAccessControlEntryView {
        return new IdProviderAccessControlEntryView(option.getDisplayValue(), option.isReadOnly());
    }

}

export class IdProviderAccessControlComboBoxBuilder
    extends PrincipalContainerComboboxBuilder<IdProviderAccessControlEntry> {

    selectedOptionsView: IdProviderACESelectedOptionsView = new IdProviderACESelectedOptionsView();

    loader: UsersPrincipalLoader = new UsersPrincipalLoader();

    build(): IdProviderAccessControlComboBox {
        return new IdProviderAccessControlComboBox(this);
    }
}
