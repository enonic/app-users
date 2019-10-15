import {Path} from 'lib-admin-ui/rest/Path';
import {JsonRequest} from 'lib-admin-ui/rest/JsonRequest';
import {StringHelper} from 'lib-admin-ui/util/StringHelper';
import {HttpRequest} from 'lib-admin-ui/rest/HttpRequest';

export class GraphQlRequest<RAW_JSON_TYPE, PARSED_TYPE>
    implements HttpRequest<PARSED_TYPE> {

    private path: Path;

    constructor() {
        this.path = Path.fromString(window['CONFIG'] && window['CONFIG']['graphQlUrl']);
    }

    private getParams(query: string, mutation: string): Object {
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

    query(): Q.Promise<RAW_JSON_TYPE> {
        return this.send(this.getQuery(), null);
    }

    mutate(): Q.Promise<RAW_JSON_TYPE> {
        return this.send(null, this.getMutation());
    }

    private send(query: string, mutation: string): Q.Promise<RAW_JSON_TYPE> {

        if (this.validate()) {

            let jsonRequest = new JsonRequest<RAW_JSON_TYPE>()
                .setMethod('POST')
                .setParams(this.getParams(query, mutation))
                .setPath(this.path);

            return jsonRequest.send().then(response => {
                const json = response.getJson() || {};
                const result = json.data || {};
                if (json.errors) {
                    const firstError = json.errors[0];
                    const error = firstError && firstError.exception && firstError.exception.message;
                    result.error = error;
                    console.warn('GraphQl response contains errors: ', json.errors);
                }
                return result;
            }, error => {
                console.error('GraphQl request error: ', error);
            });
        }
    }

    sendAndParse(): Q.Promise<PARSED_TYPE> {
        throw new Error('sendAndParse method was not implemented');
    }
}
