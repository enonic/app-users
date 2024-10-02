import {UserItemsTreeList} from './UserItemsTreeList';
import {UserItemType} from './UserItemType';
import * as Q from 'q';
import {UserTreeGridItem, UserTreeGridItemBuilder, UserTreeGridItemType} from './UserTreeGridItem';
import {ListUserItemsRequest} from '../../graphql/principal/ListUserItemsRequest';
import {IdProvider} from '../principal/IdProvider';
import {ListIdProvidersRequest} from '../../graphql/idprovider/ListIdProvidersRequest';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';

export class UserItemsTreeRootList extends UserItemsTreeList {

    private searchString: string;
    private searchTypes: UserItemType[];
    private latestIdProviders: IdProvider[];
    private constraintItems: string[];

    setSearchString(searchString: string): this {
        this.searchString = searchString;
        return this;
    }

    setSearchTypes(searchTypes: UserItemType[]): this {
        this.searchTypes = searchTypes;
        return this;
    }

    isFiltered(): boolean {
        return !!this.searchString || !!this.searchTypes;
    }

    setConstraintItems(items: string[]): this {
        this.constraintItems = items;
        return this;
    }

    resetFilter(): void {
        this.searchString = null;
        this.searchTypes = null;
        this.latestIdProviders = null;
        this.constraintItems = null;
        this.load();
    }

    protected fetchRoot(): Q.Promise<UserTreeGridItem[]> {
        if (this.isFiltered()) {
            return this.fetchFilteredItems();
        }

        return super.fetchRoot();
    }

    private fetchFilteredItems(): Q.Promise<UserTreeGridItem[]> {
        // load list of idproviders to set for filtered users/groups
        const idProvidersPromise = this.latestIdProviders ? Q.resolve() : new ListIdProvidersRequest().sendAndParse().then((idProviders) => {
            this.latestIdProviders = idProviders;
            return Q.resolve();
        }).catch(DefaultErrorHandler.handle);


        return idProvidersPromise.then(() => {
            return new ListUserItemsRequest()
                .setCount(20)
                .setTypes(this.searchTypes)
                .setItems(this.constraintItems)
                .setQuery(this.searchString)
                .setStart(this.getItemCount())
                .sendAndParse()
                .then((result) => {
                    return result.userItems.map(userItem => {
                        const builder = new UserTreeGridItemBuilder();

                        if (userItem instanceof Principal) {
                            const idProv = this.latestIdProviders.find(idProv => idProv.getKey().equals(userItem.getKey().getIdProvider()));
                           builder.setPrincipal(userItem).setIdProvider(idProv).setType(UserTreeGridItemType.PRINCIPAL);
                        } else if (userItem instanceof IdProvider) {
                            builder.setIdProvider(userItem).setType(UserTreeGridItemType.ID_PROVIDER);
                        }

                        return builder.build();
                    });
                });
        });

    }

    isLoadAllowed(): boolean {
        return this.isFiltered() ? true : super.isLoadAllowed();
    }
}
