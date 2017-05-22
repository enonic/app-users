import Path = api.rest.Path;
import JsonResponse = api.rest.JsonResponse;
import JsonRequest = api.rest.JsonRequest;
import StringHelper = api.util.StringHelper;

export class GraphQlRequest<RAW_JSON_TYPE, PARSED_TYPE> {

    private path: Path;

    private method: string = 'GET';

    private heavyOperation: boolean;

    private timeoutMillis: number;

    constructor() {
        this.path = Path.fromString(window['CONFIG'] && window['CONFIG']['graphQlUrl']);
    }

    getParams(): Object {
        let params: any = {};
        let query = this.getQuery();
        if (!StringHelper.isEmpty(query)) {
            params.query = query;
        }
        return params;
    }

    getQuery() {
        return ''
    }

    getQueryParams(): string[] {
        return [];
    }

    setTimeout(timeoutMillis: number) {
        this.timeoutMillis = timeoutMillis;
    }

    setHeavyOperation(value: boolean) {
        this.heavyOperation = value;
    }

    validate() {
        // Override to ensure any validation of ResourceRequest before sending.
        return true;
    }

    send(): wemQ.Promise<RAW_JSON_TYPE> {

        if (this.validate()) {

            let jsonRequest = new JsonRequest<RAW_JSON_TYPE>()
                .setMethod(this.method)
                .setParams(this.getParams())
                .setPath(this.path)
                .setTimeout(!this.heavyOperation ? this.timeoutMillis : 0);

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