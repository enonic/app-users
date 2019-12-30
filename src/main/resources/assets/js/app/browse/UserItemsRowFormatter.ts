import {UserTreeGridItem} from './UserTreeGridItem';
import {UserTreeGridItemViewer} from './UserTreeGridItemViewer';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';

export class UserItemsRowFormatter {

    public static nameFormatter({}: any, {}: any, {}: any, {}: any, dataContext: TreeNode<UserTreeGridItem>) {
        let viewer = <UserTreeGridItemViewer>dataContext.getViewer('displayName');
        if (!viewer) {
            viewer = new UserTreeGridItemViewer();
            viewer.setObject(dataContext.getData(), dataContext.calcLevel() > 1);
            dataContext.setViewer('displayName', viewer);
        }
        return viewer.toString();
    }
}
