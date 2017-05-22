import {GraphQlRequest} from './GraphQlRequest';
import StringHelper = api.util.StringHelper;

export class MutationGraphQlRequest<RAW_JSON_TYPE, PARSED_TYPE>
    extends GraphQlRequest<RAW_JSON_TYPE, PARSED_TYPE> {

    getParams(): Object {
        let params: any = {};
        let mutation = this.getMutation();
        if (!StringHelper.isEmpty(mutation)) {
            params.mutation = mutation;
        }
        return params;
    }

    getMutation() {
        return '';
    }
}