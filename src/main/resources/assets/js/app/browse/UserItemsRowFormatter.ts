import {UserTreeGridItem} from './UserTreeGridItem';
import {UserTreeGridItemViewer} from './UserTreeGridItemViewer';
import {TreeNode} from '@enonic/lib-admin-ui/ui/treegrid/TreeNode';

export class UserItemsRowFormatter {

    // why 4 random empty objects?
    public static nameFormatter({}: Object, {}: Object, {}: Object, {}: Object, dataContext: TreeNode<UserTreeGridItem>): string {
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
