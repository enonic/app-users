import UserStoreListResult = api.security.UserStoreListResult;
import UserStore = api.security.UserStore;
import UserStoreJson = api.security.UserStoreJson;
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


    getQueryParams(): string[] {
        let filter = super.getQueryParams();
        if (this.start > 0) {
            filter.push(`start: ${this.start}`);
        }
        if (this.count > 0) {
            filter.push(`count: ${this.count}`);
        }
        if (!!this.sort) {
            filter.push(`sort: "${this.sort}"`);
        }
        return filter;
    }
}