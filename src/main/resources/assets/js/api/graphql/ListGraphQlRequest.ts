import {GraphQlRequest} from './GraphQlRequest';

export class ListGraphQlRequest<RAW_JSON_TYPE, PARSED_TYPE>
    extends GraphQlRequest<RAW_JSON_TYPE, PARSED_TYPE> {

    protected start: number;
    protected count: number;
    protected sort: string;

    setStart(value: number): ListGraphQlRequest<RAW_JSON_TYPE, PARSED_TYPE> {
        this.start = value;
        return this;
    }

    setCount(value: number): ListGraphQlRequest<RAW_JSON_TYPE, PARSED_TYPE> {
        this.count = value;
        return this;
    }

    setSort(value: string): ListGraphQlRequest<RAW_JSON_TYPE, PARSED_TYPE> {
        this.sort = value;
        return this;
    }

    getVariables(): { [key: string]: any } {
        let vars = super.getVariables();
        if (this.start > 0) {
            vars['start'] = this.start;
        }
        if (this.count > 0) {
            vars['count'] = this.count;
        }
        if (!!this.sort) {
            vars['sort'] = this.sort;
        }
        return vars;
    }
}
