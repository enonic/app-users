import {TreeNode} from '@enonic/lib-admin-ui/ui/treegrid/TreeNode';
import {UserTypesTreeGridItemViewer} from './UserTypesTreeGridItemViewer';
import {UserTypeTreeGridItem} from './UserTypeTreeGridItem';

export class UserItemTypesRowFormatter {

    public static nameFormatter(_row: number, _cell: number, _value: unknown,
                                _columnDef: unknown, dataContext: TreeNode<UserTypeTreeGridItem>): string {
        let viewer: UserTypesTreeGridItemViewer = <UserTypesTreeGridItemViewer>dataContext.getViewer('displayName');
        if (!viewer) {
            const isRootNode = dataContext.calcLevel() === 1;
            viewer = new UserTypesTreeGridItemViewer(isRootNode);
            viewer.setObject(dataContext.getData());
            dataContext.setViewer('displayName', viewer);
        }
        return viewer.toString();
    }
}
