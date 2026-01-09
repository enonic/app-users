import {ReportServerChange} from './ReportServerChange';
import {NodeEventJson, NodeServerEvent} from '@enonic/lib-admin-ui/event/NodeServerEvent';
import {NodeServerChangeType} from '@enonic/lib-admin-ui/event/NodeServerChange';
import {ReportServerChangeItem} from './ReportServerChangeItem';

export class ReportServerEvent
    extends NodeServerEvent {

    constructor(change: ReportServerChange) {
        super(change);
    }

    getType(): NodeServerChangeType {
        return this.getNodeChange() ? this.getNodeChange().getChangeType() : null;
    }

    getNodeChange(): ReportServerChange {
        return super.getNodeChange() as ReportServerChange;
    }

    static is(eventJson: NodeEventJson): boolean {
        return eventJson.data.nodes?.some(node => node.path.indexOf('/reports') === 0);
    }

    static fromJson(nodeEventJson: NodeEventJson): ReportServerEvent {
        const change = ReportServerChange.fromJson(nodeEventJson);
        return new ReportServerEvent(change);
    }
}
