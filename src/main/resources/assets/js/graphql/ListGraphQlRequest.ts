import {GraphQlRequest} from './GraphQlRequest';

export interface ListGraphQlProperties {
    start: number;
    count: number;
    sort: string;
}

export class ListGraphQlRequest<PARSED_TYPE>
    extends GraphQlRequest<PARSED_TYPE> {

    protected start: number;
    protected count: number;
    protected sort: string;

    setStart(value: number): ListGraphQlRequest<PARSED_TYPE> {
        this.start = value;
        return this;
    }

    setCount(value: number): ListGraphQlRequest<PARSED_TYPE> {
        this.count = value;
        return this;
    }

    setSort(value: string): ListGraphQlRequest<PARSED_TYPE> {
        this.sort = value;
        return this;
    }

    override getVariables(): ListGraphQlProperties {
        let vars = <ListGraphQlProperties>super.getVariables();
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
