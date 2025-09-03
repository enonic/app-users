import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {StringHelper} from '@enonic/lib-admin-ui/util/StringHelper';
import {HttpRequest} from '@enonic/lib-admin-ui/rest/HttpRequest';
import {PostRequest} from '@enonic/lib-admin-ui/rest/PostRequest';
import {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import Q from 'q';

export interface GraphQlMutationResponse {
    error?: string;
}

export class GraphQlRequest<PARSED_TYPE>
    implements HttpRequest<PARSED_TYPE> {

    private readonly path: Path;

    constructor() {
        this.path = Path.fromString(CONFIG.getString('apis.graphQlUrl'));
    }

    private getParams(query: string, mutation: string): object {
        const params: object = {};
        if (!StringHelper.isEmpty(query)) {
            params['query'] = query;
        }
        if (!StringHelper.isEmpty(mutation)) {
            params['mutation'] = mutation;
        }
        const vars = this.getVariables();
        if (vars && Object.keys(vars).length > 0) {
            params['variables'] = vars;
        }
        return params;
    }

    getVariables(): object {
        return {};
    }

    getQuery(): string {
        throw Error('getQuery() should be overridden to use query()');
    }

    getMutation(): string {
        throw Error('getMutation() should be overridden to use mutate()');
    }

    validate(): boolean {
        // Override to ensure any validation of ResourceRequest before sending.
        return true;
    }

    query(): Q.Promise<object> {
        return this.send(this.getQuery(), null);
    }

    mutate(): Q.Promise<object> {
        return this.send(null, this.getMutation());
    }

    private send(query: string, mutation: string): Q.Promise<object> {

        if (this.validate()) {
            const jsonRequest = new PostRequest()
                .setParams(this.getParams(query, mutation))
                .setPath(this.path);

            return jsonRequest.send().then((rawResponse: unknown) => {
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
