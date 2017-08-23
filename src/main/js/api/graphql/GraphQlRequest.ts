import Path = api.rest.Path;
import JsonResponse = api.rest.JsonResponse;
import JsonRequest = api.rest.JsonRequest;
import StringHelper = api.util.StringHelper;

export class GraphQlRequest<RAW_JSON_TYPE, PARSED_TYPE> {

    private path: Path;

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
            params['variables'] = vars;
        }
        return params;
    }

    getVariables(): { [key: string]: any } {
        return {};
    }

    getQuery(): string {
        throw 'getQuery() should be overridden to use query()';
    }

    getMutation(): string {
        throw 'getMutation() should be overridden to use mutate()';
    }

    validate() {
        // Override to ensure any validation of ResourceRequest before sending.
        return true;
    }

    query(): wemQ.Promise<RAW_JSON_TYPE> {
        return this.send(this.getQuery(), null);
    }

    mutate(): wemQ.Promise<RAW_JSON_TYPE> {
        return this.send(null, this.getMutation());
    }

    private send(query: string, mutation: string): wemQ.Promise<RAW_JSON_TYPE> {

        if (this.validate()) {

            let jsonRequest = new JsonRequest<RAW_JSON_TYPE>()
                .setMethod('POST')
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