import {Path} from 'lib-admin-ui/rest/Path';
import {StringHelper} from 'lib-admin-ui/util/StringHelper';
import {HttpRequest} from 'lib-admin-ui/rest/HttpRequest';
import {PostRequest} from 'lib-admin-ui/rest/PostRequest';
import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';
import * as Q from 'q';

export class GraphQlRequest<PARSED_TYPE>
    implements HttpRequest<PARSED_TYPE> {

    private readonly path: Path;

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

    validate(): boolean {
        // Override to ensure any validation of ResourceRequest before sending.
        return true;
    }

    query(): Q.Promise<any> {
        return this.send(this.getQuery(), null);
    }

    mutate(): Q.Promise<any> {
        return this.send(null, this.getMutation());
    }

    private send(query: string, mutation: string): Q.Promise<any> {

        if (this.validate()) {
            const jsonRequest = new PostRequest()
                .setParams(this.getParams(query, mutation))
                .setPath(this.path);

            return jsonRequest.send().then((rawResponse: any) => {
                const json = new JsonResponse(rawResponse).getJson() || {};
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
