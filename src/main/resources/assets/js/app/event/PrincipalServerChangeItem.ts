import {NodeServerChangeItem, NodeServerChangeItemBuilder} from 'lib-admin-ui/event/NodeServerChangeItem';
import {NodeEventNodeJson} from 'lib-admin-ui/event/NodeServerEvent';
import {NodePath} from 'lib-admin-ui/NodePath';

export class PrincipalServerChangeItem
    extends NodeServerChangeItem {

    private static pathPrefix: string = '/identity';

    constructor(builder: PrincipalServerChangeItemBuilder) {
        super(builder);
    }

    protected processPath(path: string): NodePath {
        return super.processPath(path?.substr(PrincipalServerChangeItem.pathPrefix.length));
    }

    static fromJson(json: NodeEventNodeJson): PrincipalServerChangeItem {
        return new PrincipalServerChangeItemBuilder().fromJson(json).build();
    }

}

export class PrincipalServerChangeItemBuilder
    extends NodeServerChangeItemBuilder {

    fromJson(json: NodeEventNodeJson): PrincipalServerChangeItemBuilder {
        super.fromJson(json);

        return this;
    }

    build(): PrincipalServerChangeItem {
        return new PrincipalServerChangeItem(this);
    }
}
