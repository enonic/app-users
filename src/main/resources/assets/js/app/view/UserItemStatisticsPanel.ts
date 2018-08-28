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
import PrincipalViewer = api.ui.security.PrincipalViewer;
import i18n = api.util.i18n;
import RoleKeys = api.security.RoleKeys;
import DivEl = api.dom.DivEl;
import IsAuthenticatedRequest = api.security.auth.IsAuthenticatedRequest;

export class UserItemStatisticsPanel
    extends ItemStatisticsPanel<UserTreeGridItem> {

    private userDataContainer: api.dom.DivEl;

    private isAdminPromise: wemQ.Promise<boolean>;

    constructor() {
        super('principal-item-statistics-panel');

        this.isAdminPromise = new IsAuthenticatedRequest().sendAndParse().then(result => this.isAdmin(result.getPrincipals()));

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

        return this.fetchPrincipal(principal.getKey()).then((p: Principal) => {
            const user = p.asUser();
            const mems = user.getMemberships();
            mainGroup.addDataList(i18n('field.email'), user.getEmail());
            this.appendTransitiveSwitch(principal.getKey(), rolesAndGroupsGroup, mems.length === 0);
            this.appendRolesAndGroups(mems, rolesAndGroupsGroup);

            return this.isAdminPromise.then(isAdmin => {
                if (isAdmin) {
                    addedGroups.push(this.createReportGroup(principal));
                }
                return addedGroups;
            });

        });
    }

    private isAdmin(principals: PrincipalKey[]): boolean {
        return principals.some(pKey => pKey.equals(RoleKeys.ADMIN));
    }

    private createGroupOrRoleMetadataGroups(principal: Principal, mainGroup: ItemDataGroup): wemQ.Promise<ItemDataGroup[]> {
        mainGroup.appendChild(new api.dom.DivEl('description').setHtml(principal.getDescription()));
        this.userDataContainer.appendChild(mainGroup);

        let membersGroup;
        membersGroup = new ItemDataGroup(i18n('field.members'), 'members');
        this.userDataContainer.appendChild(membersGroup);

        const addedGroups = [mainGroup, membersGroup, this.createReportGroup(principal)];

        return this.fetchPrincipal(principal.getKey()).then((p: Principal) => {
            const group = p.isGroup() ? p.asGroup() : p.asRole();

            if (p.isGroup()) {
                const mems = p.asGroup().getMemberships();
                const rolesGroup = new ItemDataGroup(i18n('field.rolesAndGroups'), 'memberships');
                this.appendTransitiveSwitch(principal.getKey(), rolesGroup, mems.length === 0);
                this.userDataContainer.appendChild(rolesGroup);

                this.appendRolesAndGroups(mems, rolesGroup);

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

        const comboAndButton = new DivEl();
        comboAndButton.appendChildren<api.dom.Element>(reportsCombo, genButton);

        reportsGroup.addDataElements(i18n('field.repository.select'), [comboAndButton]);
        const generatedReports = reportsGroup.addDataElements(i18n('field.report.generated'), [reportsProgress]);
        generatedReports.setVisible(false);

        const handleReportsChanged = () => generatedReports.setVisible(reportsProgress.getItemCount() > 0);
        reportsProgress.onItemsRemoved(handleReportsChanged);
        reportsProgress.onItemsAdded(handleReportsChanged);

        return reportsGroup;
    }

    private appendRolesAndGroups(memberships: api.security.Principal[], group: ItemDataGroup) {
        const roleViews = memberships.filter(el => el.isRole()).map(el => this.createPrincipalViewer(el));
        group.addDataElements(i18n('field.roles'), roleViews);

        const groupViews = memberships.filter(el => el.isGroup()).map(el => this.createPrincipalViewer(el));
        group.addDataElements(i18n('field.groups'), groupViews);
    }

    private fetchPrincipal(pKey: PrincipalKey, transitiveMemberships?: boolean) {
        return new GetPrincipalByKeyRequest(pKey)
            .setIncludeMemberships(true)
            .setTransitiveMemberships(transitiveMemberships)
            .sendAndParse();
    }

    private appendTransitiveSwitch(pKey: PrincipalKey, dataGroup: api.app.view.ItemDataGroup, disabled?: boolean) {
        const transitiveSwitch = new api.ui.CheckboxBuilder()
            .setLabelText(i18n('field.transitiveMemberships'))
            .build().setDisabled(disabled);
        transitiveSwitch.addClass('transitive-switch');
        transitiveSwitch.onValueChanged(event => {
            this.fetchPrincipal(pKey, 'true' === event.getNewValue()).then(updatedP => {
                const updatedMems = (updatedP.isGroup() ? updatedP.asGroup() : updatedP.asUser()).getMemberships();
                dataGroup.clearList();
                this.appendRolesAndGroups(updatedMems, dataGroup);
            }).catch(api.DefaultErrorHandler.handle);
        });
        dataGroup.getHeader().appendChild(transitiveSwitch);
    }
}
