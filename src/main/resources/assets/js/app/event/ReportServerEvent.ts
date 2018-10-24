import NodeServerChangeType = api.event.NodeServerChangeType;
import {ReportServerChange} from './ReportServerChange';

export class ReportServerEvent
    extends api.event.NodeServerEvent {

    constructor(change: ReportServerChange) {
        super(change);
    }

    getType(): NodeServerChangeType {
        return this.getNodeChange() ? this.getNodeChange().getChangeType() : null;
    }

    getNodeChange(): ReportServerChange {
        return <ReportServerChange>super.getNodeChange();
    }

    static is(eventJson: api.event.NodeEventJson): boolean {
        return eventJson.data.nodes.some(node => node.path.indexOf('/reports') === 0);
    }

    static fromJson(nodeEventJson: api.event.NodeEventJson): ReportServerEvent {
        const change = ReportServerChange.fromJson(nodeEventJson);
        return new ReportServerEvent(change);
    }
}
