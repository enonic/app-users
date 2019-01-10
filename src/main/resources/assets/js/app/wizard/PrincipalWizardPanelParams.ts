import {UserItemWizardPanelParams} from './UserItemWizardPanelParams';
import {IdProvider} from '../principal/IdProvider';
import Principal = api.security.Principal;
import PrincipalType = api.security.PrincipalType;
import PrincipalKey = api.security.PrincipalKey;

export class PrincipalWizardPanelParams extends UserItemWizardPanelParams<Principal> {

    persistedType: PrincipalType;

    idProvider: IdProvider;

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

    setIdProvider(value: IdProvider): PrincipalWizardPanelParams {
        this.idProvider = value;
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
