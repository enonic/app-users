import NodeEventJson = api.event.NodeEventJson;
import NodeEventNodeJson = api.event.NodeEventNodeJson;
import NodeServerChange = api.event.NodeServerChange;
import NodeServerChangeType = api.event.NodeServerChangeType;
import NodeServerChangeItem = api.event.NodeServerChangeItem;

export class ReportServerChangeItem
    extends NodeServerChangeItem<string> {

    private id: string;

    constructor(id: string, path: string, branch: string) {
        super(path, branch);

        this.id = id;
    }

    getId(): string {
        return this.id;
    }

    static fromJson(node: NodeEventNodeJson): ReportServerChangeItem {
        return new ReportServerChangeItem(node.id, node.path.substr('/reports'.length), node.branch);
    }
}

export class ReportServerChange
    extends NodeServerChange<string> {

    constructor(type: NodeServerChangeType, changeItems: ReportServerChangeItem[], newReportPaths?: string[]) {
        super(type, changeItems, newReportPaths);
    }

    getChangeType(): NodeServerChangeType {
        return this.type;
    }

    toString(): string {
        return NodeServerChangeType[this.type] + ': <' +
               this.changeItems.map((item) => item.getPath()).join(', ') + !!this.newNodePaths
               ? this.newNodePaths.join(', ')
               : '' +
                 '>';
    }

    static fromJson(nodeEventJson: NodeEventJson): ReportServerChange {

        let changedItems = nodeEventJson.data.nodes.filter((node) => node.path.indexOf('/reports') === 0).map(
            (node: NodeEventNodeJson) => ReportServerChangeItem.fromJson(node));

        if (changedItems.length === 0) {
            return null;
        }

        let reportEventType = this.getNodeServerChangeType(nodeEventJson.type);
        return new ReportServerChange(reportEventType, changedItems);
    }
}
