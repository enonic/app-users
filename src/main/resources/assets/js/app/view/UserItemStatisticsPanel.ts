import '../../api.ts';
import {UserTreeGridItem, UserTreeGridItemType} from '../browse/UserTreeGridItem';
import {GetPrincipalByKeyRequest} from '../../api/graphql/principal/GetPrincipalByKeyRequest';
import {GetPrincipalsByKeysRequest} from '../../api/graphql/principal/GetPrincipalsByKeysRequest';
import {RepositoryComboBox} from '../report/RepositoryComboBox';
import {GeneratePermissionsReportRequest} from '../../api/graphql/report/GeneratePermissionsReportRequest';
import {ReportProgressList} from '../report/ReportProgressList';
import ViewItem = api.app.view.ViewItem;
import ItemStatisticsPanel = api.app.view.ItemStatisticsPanel;
import ItemDataGroup = api.app.view.ItemDataGroup;
import Principal = api.security.Principal;
import PrincipalType = api.security.PrincipalType;
import PrincipalKey = api.security.PrincipalKey;
import User = api.security.User;
import PrincipalViewer = api.ui.security.PrincipalViewer;
import i18n = api.util.i18n;
import RoleKeys = api.security.RoleKeys;

export class UserItemStatisticsPanel
    extends ItemStatisticsPanel<UserTreeGridItem> {

    private userDataContainer: api.dom.DivEl;

    constructor() {
        super('principal-item-statistics-panel');

        this.userDataContainer = new api.dom.DivEl('user-data-container');
        this.appendChild(this.userDataContainer);
    }

    setItem(item: ViewItem<UserTreeGridItem>) {
        let currentItem = this.getItem();

        if (!currentItem || !currentItem.equals(item)) {

            switch (item.getModel().getType()) {
            case UserTreeGridItemType.PRINCIPAL:
                this.populatePrincipalViewItem(item);
                break;
            default:

            }

            this.userDataContainer.removeChildren();

            this.appendMetadata(item);

            super.setItem(item);
        }
    }

    private populatePrincipalViewItem(item: ViewItem<UserTreeGridItem>) {
        item.setPathName(item.getModel().getPrincipal().getKey().getId());
        item.setPath(item.getModel().getPrincipal().getKey().toPath(true));
        item.setIconSize(128);
    }

    private appendMetadata(item: ViewItem<UserTreeGridItem>) {
        const principal = item.getModel().getPrincipal();
        const type = principal ? principal.getTypeName().toLowerCase() : '';

        if (type) {
            const mainGroup = new ItemDataGroup(i18n(`field.${type}`), type);
            let metaGroups: wemQ.Promise<ItemDataGroup[]>;

            switch (principal.getType()) {
            case PrincipalType.USER:
                metaGroups = this.createUserMetadataGroups(principal, mainGroup);
                break;
            case PrincipalType.GROUP:
                metaGroups = this.createGroupOrRoleMetadataGroups(principal, mainGroup);
                break;
            case PrincipalType.ROLE:
                metaGroups = this.createGroupOrRoleMetadataGroups(principal, mainGroup);
                break;
            }

            metaGroups.then((groups: ItemDataGroup[]) => {
                this.userDataContainer.removeChildren();
                this.userDataContainer.appendChildren(...groups);
            }).catch((reason: any) => {
                api.DefaultErrorHandler.handle(reason);
            }).done();
        }
    }

    private createPrincipalViewer(principal: Principal): PrincipalViewer {
        const viewer = new PrincipalViewer();
        viewer.setObject(principal);
        return viewer;
    }

    private createUserMetadataGroups(principal: Principal, mainGroup: ItemDataGroup): wemQ.Promise<ItemDataGroup[]> {
        this.userDataContainer.appendChild(mainGroup);

        const rolesAndGroupsGroup = new ItemDataGroup(i18n('field.rolesAndGroups'), 'memberships');
        this.userDataContainer.appendChild(rolesAndGroupsGroup);

        const addedGroups = [mainGroup, rolesAndGroupsGroup];

        return new GetPrincipalByKeyRequest(principal.getKey()).sendAndParse().then((p: Principal) => {
            const user = p.asUser();
            mainGroup.addDataList(i18n('field.email'), user.getEmail());

            const roles = user.getMemberships().filter(el => el.isRole()).map(el => this.createPrincipalViewer(el));
            rolesAndGroupsGroup.addDataElements(i18n('field.roles'), roles);

            const groups = user.getMemberships().filter(el => el.isGroup()).map(el => this.createPrincipalViewer(el));
            rolesAndGroupsGroup.addDataElements(i18n('field.groups'), groups);

            if (this.isAdmin(user)) {
                addedGroups.push(this.createReportGroup(principal));
            }

            return addedGroups;
        });
    }

    private isAdmin(user: User): boolean {
        return user.getMemberships().some(mship => mship.getKey().equals(RoleKeys.ADMIN));
    }

    private createGroupOrRoleMetadataGroups(principal: Principal, mainGroup: ItemDataGroup): wemQ.Promise<ItemDataGroup[]> {
        mainGroup.appendChild(new api.dom.DivEl('description').setHtml(principal.getDescription()));
        this.userDataContainer.appendChild(mainGroup);

        let membersGroup;
        membersGroup = new ItemDataGroup(i18n('field.members'), 'members');
        this.userDataContainer.appendChild(membersGroup);

        const addedGroups = [mainGroup, membersGroup, this.createReportGroup(principal)];

        return new GetPrincipalByKeyRequest(principal.getKey()).sendAndParse().then((p: Principal) => {
            const group = principal.isGroup() ? p.asGroup() : p.asRole();

            if (principal.isGroup()) {
                const rolesGroup = new ItemDataGroup(i18n('field.roles'), 'roles');
                this.userDataContainer.appendChild(rolesGroup);
                rolesGroup.addDataElements(null, p.asGroup().getMemberships().map(el => this.createPrincipalViewer(el)));
                addedGroups.splice(1, 0, rolesGroup);
            }

            const membersKeys = group.getMembers().slice(0, 100);
            return this.getMembersByKeys(membersKeys).then((results) => {
                membersGroup.addDataElements(null, results.map(el => this.createPrincipalViewer(el)));
                return addedGroups;
            });
        });
    }

    private getMembersByKeys(keys: PrincipalKey[]): wemQ.Promise<Principal[]> {
        if (!keys || keys.length === 0) {
            return wemQ([]);
        } else {
            return new GetPrincipalsByKeysRequest(keys).sendAndParse();
        }
    }

    private createReportGroup(principal: Principal): ItemDataGroup {
        const reportsGroup = new ItemDataGroup(i18n('field.report'), 'reports');

        const reportsCombo = new RepositoryComboBox();
        reportsCombo.onOptionSelected(event => {
            if (!genButton.isEnabled()) {
                genButton.setEnabled(true);
            }
        });
        reportsCombo.onOptionDeselected(event => {
            if (reportsCombo.getSelectedValues().length === 0) {
                genButton.setEnabled(false);
            }
        });

        const reportsProgress = new ReportProgressList(principal.getKey());

        const genButton = new api.ui.button.Button(i18n('action.report.generate'));
        genButton
            .setEnabled(false)
            .addClass('generate large')
            .onClicked(() => {
                const repos = reportsCombo.getSelectedDisplayValues();
                repos.forEach(repo => {
                    reportsCombo.deselect(repo);
                });

                new GeneratePermissionsReportRequest()
                    .setPrincipalKey(principal.getKey())
                    .setRepositoryKeys(repos.map(repo => repo.getId()))
                    .sendAndParse()
                    .then(reports => {
                        reports.forEach(report => {
                            // might have been added by progress listener if it happened before
                            if (!reportsProgress.getItem(report.getId())) {
                                reportsProgress.addItem(report);
                            }
                        });
                    });
            });

        reportsGroup.addDataElements(i18n('field.repository.select'), [reportsCombo, reportsProgress, genButton]);

        return reportsGroup;
    }
}
