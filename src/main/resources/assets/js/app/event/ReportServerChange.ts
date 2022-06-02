import {NodeEventJson, NodeEventNodeJson} from '@enonic/lib-admin-ui/event/NodeServerEvent';
import {NodeServerChange, NodeServerChangeBuilder} from '@enonic/lib-admin-ui/event/NodeServerChange';
import {ReportServerChangeItem} from './ReportServerChangeItem';

export class ReportServerChange
    extends NodeServerChange {

    constructor(builder: ReportServerChangeBuilder) {
        super(builder);
    }

    static fromJson(nodeEventJson: NodeEventJson): ReportServerChange {
        return new ReportServerChangeBuilder().fromJson(nodeEventJson).build();
    }
}

export class ReportServerChangeBuilder
    extends NodeServerChangeBuilder {

    build(): ReportServerChange {
        return new ReportServerChange(this);
    }

    nodeJsonToChangeItem(node: NodeEventNodeJson): ReportServerChangeItem {
        return ReportServerChangeItem.fromJson(node);
    }

}
