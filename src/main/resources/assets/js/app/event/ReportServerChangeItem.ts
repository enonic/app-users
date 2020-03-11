import {NodeEventNodeJson} from 'lib-admin-ui/event/NodeServerEvent';
import {NodeServerChangeItem, NodeServerChangeItemBuilder} from 'lib-admin-ui/event/NodeServerChangeItem';

export class ReportServerChangeItem
    extends NodeServerChangeItem {

    constructor(builder: ReportServerChangeItemBuilder) {
        super(builder);
    }

    protected processPath(path: string): string {
        return path.substr('/reports'.length);
    }

    static fromJson(json: NodeEventNodeJson): ReportServerChangeItem {
        return new ReportServerChangeItemBuilder().fromJson(json).build();
    }
}

export class ReportServerChangeItemBuilder
    extends NodeServerChangeItemBuilder {

    fromJson(json: NodeEventNodeJson): ReportServerChangeItemBuilder {
        super.fromJson(json);
        return this;
    }

    build(): ReportServerChangeItem {
        return new ReportServerChangeItem(this);
    }
}
