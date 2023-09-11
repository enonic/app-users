import Q from 'q';
import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';
import {GetPrincipalByKeyRequest} from '../../graphql/principal/GetPrincipalByKeyRequest';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';

export class PrincipalWizardDataLoader {

    principal: Principal;

    loadData(params: PrincipalWizardPanelParams): Q.Promise<PrincipalWizardDataLoader> {

        if (!params.persistedItem && !params.principalKey) {
            return this.loadDataForNew(params);

        } else {
            return this.loadDataForEdit(params);

        }
    }

    private loadDataForNew(params: PrincipalWizardPanelParams): Q.Promise<PrincipalWizardDataLoader> {

        return Q(this);
    }

    private loadDataForEdit(params: PrincipalWizardPanelParams): Q.Promise<PrincipalWizardDataLoader> {

        return this.loadDataForNew(params).then(() => {

            return this.loadPrincipalToEdit(params).then((loadedPrincipalToEdit: Principal) => {

                this.principal = loadedPrincipalToEdit;

                return this;
            });
        });
    }

    private loadPrincipalToEdit(params: PrincipalWizardPanelParams): Q.Promise<Principal> {
        if (!params.persistedItem && !!params.principalKey) {
            return new GetPrincipalByKeyRequest(params.principalKey).setIncludeMemberships(true).sendAndParse();
        } else {
            return Q(params.persistedItem);
        }

    }

}
