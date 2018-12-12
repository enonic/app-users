import {UserTreeGridItem, UserTreeGridItemType} from '../browse/UserTreeGridItem';
import {GetPrincipalByKeyRequest} from '../../api/graphql/principal/GetPrincipalByKeyRequest';
import {GetPrincipalsByKeysRequest} from '../../api/graphql/principal/GetPrincipalsByKeysRequest';
import {RepositoryComboBox} from '../report/RepositoryComboBox';
import {User} from '../principal/User';
import {Group} from '../principal/Group';
import {Role} from '../principal/Role';
import {Repository} from '../report/Repository';
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
import Path = api.rest.Path;
import IsAuthenticatedRequest = api.security.auth.IsAuthenticatedRequest;

export class UserItemStatisticsPanel
    extends ItemStatisticsPanel<UserTreeGridItem> {

    private userDataContainer: api.dom.DivEl;

    private isAdminPromise: wemQ.Promise<boolean>;

    private reportServicePath: string;

    constructor() {
        super('principal-item-statistics-panel');

        this.isAdminPromise = new IsAuthenticatedRequest().sendAndParse().then(result => this.isAdmin(result.getPrincipals()));

        this.userDataContainer = new api.dom.DivEl('user-data-container');
        this.appendChild(this.userDataContainer);
    }

    setItem(item: ViewItem<UserTreeGridItem>) {
        const currentItem = this.getItem();

        if (item.getModel().getType() === UserTreeGridItemType.PRINCIPAL) {
            this.populatePrincipalViewItem(item);
        }

        if (!currentItem || !currentItem.equals(item)) {
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
            const user = <User>p;
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
            if (p.isGroup()) {
                const mems = (<Group>p).getMemberships();
                const rolesGroup = new ItemDataGroup(i18n('field.rolesAndGroups'), 'memberships');
                this.appendTransitiveSwitch(principal.getKey(), rolesGroup, mems.length === 0);
                this.userDataContainer.appendChild(rolesGroup);

                this.appendRolesAndGroups(mems, rolesGroup);

                addedGroups.splice(1, 0, rolesGroup);
            }

            const membersKeys = (<Group | Role>p).getMembers().slice(0, 100);
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

        const genButton = new api.ui.button.Button(i18n('action.report.generate'));
        genButton
            .setEnabled(false)
            .addClass('generate large')
            .onClicked(() => {
                const branches = reportsCombo.getSelectedBranches();
                const repos = reportsCombo.getSelectedDisplayValues();
                repos.forEach((repo: Repository, index: number) => {
                    reportsCombo.deselect(repo);
                    this.downloadReport(principal, repo, branches[index]);
                });
            });

        const comboAndButton = new DivEl();
        comboAndButton.appendChildren<api.dom.Element>(reportsCombo, genButton);

        reportsGroup.addDataElements(i18n('field.repository.select'), [comboAndButton]);

        return reportsGroup;
    }

    private downloadReport(principal: Principal, repo: Repository, branch: string) {
        const params: { [name: string]: any } = {
            principalKey: principal.getKey().toString(),
            repositoryId: repo.getId(),
            branch: branch
        };
        const uri: string = api.util.UriHelper.appendUrlParams(this.getReportServicePath(), params);
        const reportName: string = `perm-report-${repo.getName()}(${branch}).csv`;

        this.clickFakeElementForReportDownload(uri, reportName);
    }

    private getReportServicePath(): string {
        if (!this.reportServicePath) {
            this.reportServicePath = Path.fromString(window['CONFIG'] && window['CONFIG']['reportServiceUrl']).toString();
        }

        return this.reportServicePath;
    }

    private clickFakeElementForReportDownload(uri: string, fileName: string) {
        const element: HTMLElement = document.createElement('a');
        element.setAttribute('href', uri);
        element.setAttribute('download', fileName);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    private isRole(principal: api.security.Principal): boolean {
        return principal.isRole();
    }

    private isGroup(principal: api.security.Principal): boolean {
        return principal.isGroup();
    }

    private getMembershipViews(memberships: api.security.Principal[], membershipCheck: (p: api.security.Principal) => boolean) {
        return memberships
            .sort((item1, item2) => Number(item1.getDisplayName() > item2.getDisplayName()))
            .filter(el => membershipCheck(el))
            .map(el => this.createPrincipalViewer(el));
    }

    private appendRolesAndGroups(memberships: api.security.Principal[], group: ItemDataGroup) {
        const roleViews = this.getMembershipViews(memberships, this.isRole);
        const groupViews = this.getMembershipViews(memberships, this.isGroup);

        group.addDataElements(i18n('field.roles'), roleViews);
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
                const updatedMemberships = (<Group | User>updatedP).getMemberships();
                dataGroup.clearList();
                this.appendRolesAndGroups(updatedMemberships, dataGroup);
            }).catch(api.DefaultErrorHandler.handle);
        });
        dataGroup.getHeader().appendChild(transitiveSwitch);
    }
}
