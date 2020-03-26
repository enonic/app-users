import {UserTreeGridItem} from './UserTreeGridItem';
import {UserTreeGridItemViewer} from './UserTreeGridItemViewer';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';

export class UserItemsRowFormatter {

    public static nameFormatter({}: any, {}: any, {}: any, {}: any, dataContext: TreeNode<UserTreeGridItem>) {
        let viewer = <UserTreeGridItemViewer>dataContext.getViewer('displayName');
        if (!viewer) {
            viewer = new UserTreeGridItemViewer();
            viewer.setIsRelativePath(dataContext.calcLevel() > 1);
            viewer.setObject(dataContext.getData());
            dataContext.setViewer('displayName', viewer);
        }
        return viewer.toString();
    }
}
