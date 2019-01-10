import {UserItemWizardPanelParams} from './UserItemWizardPanelParams';
import {IdProvider} from '../principal/IdProvider';
import Principal = api.security.Principal;
import PrincipalType = api.security.PrincipalType;
import PrincipalKey = api.security.PrincipalKey;

export class PrincipalWizardPanelParams extends UserItemWizardPanelParams<Principal> {

    persistedType: PrincipalType;

    userStore: IdProvider;

    parentOfSameType: boolean;

    principalKey: PrincipalKey;

    setPrincipalKey(value: api.security.PrincipalKey): PrincipalWizardPanelParams {
        this.principalKey = value;
        return this;
    }

    setPersistedType(value: PrincipalType): PrincipalWizardPanelParams {
        this.persistedType = value;
        return this;
    }

    setUserStore(value: IdProvider): PrincipalWizardPanelParams {
        this.userStore = value;
        return this;
    }

    setParentOfSameType(value: boolean): PrincipalWizardPanelParams {
        this.parentOfSameType = value;
        return this;
    }

    isSystemKey(): boolean {
        return !!this.principalKey && this.principalKey.isSystem();
    }
}
