import Path = api.rest.Path;
import JsonResponse = api.rest.JsonResponse;
import JsonRequest = api.rest.JsonRequest;
import StringHelper = api.util.StringHelper;

export class GraphQlRequest<RAW_JSON_TYPE, PARSED_TYPE> {

    private path: Path;

    private method: string = 'GET';

    constructor() {
        this.path = Path.fromString(window['CONFIG'] && window['CONFIG']['graphQlUrl']);
    }

    private getParams(query, mutation): Object {
        let params: any = {};
        if (!StringHelper.isEmpty(query)) {
            params['query'] = query;
        }
        if (!StringHelper.isEmpty(mutation)) {
            params['mutation'] = mutation;
        }
        let vars = this.getVariables();
        if (vars && Object.keys(vars).length > 0) {
            params['variables'] = JSON.stringify(vars);
        }
        return params;
    }

    getVariables(): { [key: string]: any } {
        return {};
    }

    validate() {
        // Override to ensure any validation of ResourceRequest before sending.
        return true;
    }

    query(query: string): wemQ.Promise<RAW_JSON_TYPE> {
        return this.send(query, null);
    }

    mutate(mutation: string): wemQ.Promise<RAW_JSON_TYPE> {
        return this.send(null, mutation);
    }

    private send(query: string, mutation: string): wemQ.Promise<RAW_JSON_TYPE> {

        if (this.validate()) {

            let jsonRequest = new JsonRequest<RAW_JSON_TYPE>()
                .setMethod(this.method)
                .setParams(this.getParams(query, mutation))
                .setPath(this.path);

            return jsonRequest.send().then(response => {
                let json = response.getJson();
                if (json.errors) {
                    console.warn('GraphQl response contains errors: ', json.errors);
                }
                return json ? json.data : null;
            }, error => {
                console.error('GraphQl request error: ', error);
            });
        }
    }

    sendAndParse(): wemQ.Promise<PARSED_TYPE> {
        throw new Error('sendAndParse method was not implemented');
    }
}