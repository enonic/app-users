import Q from 'q';
import {PrincipalLoader as BasePrincipalLoader} from '@enonic/lib-admin-ui/security/PrincipalLoader';
import {FindPrincipalsRequest} from './FindPrincipalsRequest';
import {GetPrincipalsByKeysRequest} from './GetPrincipalsByKeysRequest';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {BaseSelectedOptionsView} from '@enonic/lib-admin-ui/ui/selector/combobox/BaseSelectedOptionsView';

export class PrincipalLoader
    extends BasePrincipalLoader {

    protected createRequest(): FindPrincipalsRequest {
        return new FindPrincipalsRequest().setSize(30) as FindPrincipalsRequest;
    }

    protected createPreLoadRequest(principalKeys: PrincipalKey[]): GetPrincipalsByKeysRequest {
        return new GetPrincipalsByKeysRequest(principalKeys);
    }

    /* If the data is less than {MAX_TO_APPEND}, then just execute the "preLoadRequest".
    Otherwise, to improve performance, lib-admin-ui will not append items after {MAX_TO_APPEND}th one
    so there's no need to execute a request for those items to get the display name, therefore
    the data is a mix of the first {MAX_TO_APPEND} ones from the request and the remaining ones built directly
    from the keys in the searchString. */
    preLoadData(searchString: string): Q.Promise<Principal[]> {
        const separator = ';';
        const max_to_append = BaseSelectedOptionsView.MAX_TO_APPEND;

        if (searchString.split(separator).length <= max_to_append) {
            return super.sendPreLoadRequest(searchString);
        }

        const firstChunk = searchString.split(separator).slice(0, max_to_append);
        const secondChunk = searchString.split(separator).slice(max_to_append);

        const firstChunkPromise = super.sendPreLoadRequest(firstChunk.join(separator));
        const secondChunkPromise = secondChunk.map(key => {
            const displayName = key.split(':').pop();
            return Principal.fromJson({key, displayName});
        });

        return Q.all([firstChunkPromise, secondChunkPromise])
            .spread((data1:Principal[], data2:Principal[]) => [...data1, ...data2]);
    }
}
