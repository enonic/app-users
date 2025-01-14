import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';
import {User} from '../principal/User';

export class UserPasswordWizardStepFormParams
    extends PrincipalWizardPanelParams {

    public user?: User;

    constructor(parentParams: PrincipalWizardPanelParams) {
        super();
        this.setPrincipalKey(parentParams.principalKey);
        this.setPersistedType(parentParams.persistedType);
        this.setIdProvider(parentParams.idProvider);
        this.setParentOfSameType(parentParams.parentOfSameType);

        this.setPersistedPath(parentParams.persistedPath);
        this.setPersistedItem(parentParams.persistedItem);
        this.setIdProviderKey(parentParams.idProviderKey);
        this.setTabId(parentParams.tabId);
        this.setPersistedDisplayName(parentParams.persistedDisplayName);
    }

    setUser(value?: User): UserPasswordWizardStepFormParams {
        this.user = value;
        return this;
    }
}
