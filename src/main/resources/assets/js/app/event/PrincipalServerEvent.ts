import {PrincipalServerChange} from './PrincipalServerChange';
import {NodeEventJson, NodeServerEvent} from '@enonic/lib-admin-ui/event/NodeServerEvent';
import {NodeServerChangeType} from '@enonic/lib-admin-ui/event/NodeServerChange';

export class PrincipalServerEvent
    extends NodeServerEvent {

    constructor(change: PrincipalServerChange) {
        super(change);
    }

    static is(eventJson: NodeEventJson): boolean {
        return eventJson.data.nodes?.some(node => node.path.indexOf('/identity') === 0);
    }

    static fromJson(nodeEventJson: NodeEventJson): PrincipalServerEvent {
        const change: PrincipalServerChange = PrincipalServerChange.fromJson(nodeEventJson);
        return new PrincipalServerEvent(change);
    }

    getType(): NodeServerChangeType {
        return this.getNodeChange() ? this.getNodeChange().getChangeType() : null;
    }

    getNodeChange(): PrincipalServerChange {
        return super.getNodeChange() as PrincipalServerChange;
    }
}
