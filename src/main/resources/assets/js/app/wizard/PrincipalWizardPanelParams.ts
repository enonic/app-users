import {UserItemWizardPanelParams} from './UserItemWizardPanelParams';
import {IdProvider} from '../principal/IdProvider';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';

export class PrincipalWizardPanelParams extends UserItemWizardPanelParams<Principal> {

    persistedType: PrincipalType;

    idProvider: IdProvider;

    parentOfSameType: boolean;

    principalKey: PrincipalKey;

    serviceAccount: boolean;

    setPrincipalKey(value: PrincipalKey): PrincipalWizardPanelParams {
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

    setServiceAccount(value: boolean): PrincipalWizardPanelParams {
        this.serviceAccount = value;
        return this;
    }

    isSystemKey(): boolean {
        return !!this.principalKey && this.principalKey.isSystem();
    }
}
