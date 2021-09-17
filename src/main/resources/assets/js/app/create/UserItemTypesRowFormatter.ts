import {UserTypeTreeGridItem} from './UserTypeTreeGridItem';
import {UserTypesTreeGridItemViewer} from './UserTypesTreeGridItemViewer';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';

export class UserItemTypesRowFormatter {

    public static nameFormatter({}: Object, {}: Object, {}: Object, {}: Object, dataContext: TreeNode<UserTypeTreeGridItem>): string {
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
