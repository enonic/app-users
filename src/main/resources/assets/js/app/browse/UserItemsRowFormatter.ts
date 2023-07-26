import {TreeNode} from '@enonic/lib-admin-ui/ui/treegrid/TreeNode';
import {UserTreeGridItem} from './UserTreeGridItem';
import {UserTreeGridItemViewer} from './UserTreeGridItemViewer';

export class UserItemsRowFormatter {

    // why 4 random empty objects?
    public static nameFormatter(_row: number, _cell: number, _value: unknown,
                                _columnDef: unknown, dataContext: TreeNode<UserTreeGridItem>): string {
        let viewer = dataContext.getViewer('displayName') as UserTreeGridItemViewer;
        if (!viewer) {
            viewer = new UserTreeGridItemViewer();
            viewer.setIsRelativePath(dataContext.calcLevel() > 1);
            viewer.setObject(dataContext.getData());
            dataContext.setViewer('displayName', viewer);
        }
        return viewer.toString();
    }
}
