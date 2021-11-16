import * as Q from 'q';
import {UserTreeGridItem, UserTreeGridItemType} from '../browse/UserTreeGridItem';
import {GetPrincipalByKeyRequest} from '../../graphql/principal/GetPrincipalByKeyRequest';
import {GetPrincipalsByKeysRequest} from '../../graphql/principal/GetPrincipalsByKeysRequest';
import {RepositoryComboBox} from '../report/RepositoryComboBox';
import {User} from '../principal/User';
import {Group} from '../principal/Group';
import {Role} from '../principal/Role';
import {Repository} from '../report/Repository';
import {PrincipalServerEventsHandler} from '../event/PrincipalServerEventsHandler';
import {ItemStatisticsPanel} from 'lib-admin-ui/app/view/ItemStatisticsPanel';
import {ItemDataGroup} from 'lib-admin-ui/app/view/ItemDataGroup';
import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {PrincipalViewer} from 'lib-admin-ui/ui/security/PrincipalViewer';
import {RoleKeys} from 'lib-admin-ui/security/RoleKeys';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {Path} from 'lib-admin-ui/rest/Path';
import {IsAuthenticatedRequest} from 'lib-admin-ui/security/auth/IsAuthenticatedRequest';
import {AppHelper} from 'lib-admin-ui/util/AppHelper';
import {i18n} from 'lib-admin-ui/util/Messages';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {UriHelper} from 'lib-admin-ui/util/UriHelper';
import {CheckboxBuilder} from 'lib-admin-ui/ui/Checkbox';
import {Element} from 'lib-admin-ui/dom/Element';
import {Button} from 'lib-admin-ui/ui/button/Button';
import {UserItemStatisticsHeader} from './UserItemStatisticsHeader';
import {LoginResult} from 'lib-admin-ui/security/auth/LoginResult';

export class UserItemStatisticsPanel
    extends ItemStatisticsPanel {

    private readonly userDataContainer: DivEl;

    private reportServicePath: string;

    private readonly header: UserItemStatisticsHeader;

    private static BATCH_SIZE = 10;

    constructor() {
        super('principal-item-statistics-panel');

        this.userDataContainer = new DivEl('user-data-container');

        this.header = new UserItemStatisticsHeader();

        this.bindServerEventListeners();
    }

    private static createPrincipalViewer(principal: Principal): PrincipalViewer {
        const viewer: PrincipalViewer = new PrincipalViewer();
        viewer.setObject(principal);
        return viewer;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.appendChild(this.header);
            this.appendChild(this.userDataContainer);

            return rendered;
        });
    }

    setItem(item: UserTreeGridItem) {
        const currentItem = this.getItem();

        if (!currentItem || !currentItem.equals(item)) {
            this.refreshPanel(item);

            super.setItem(item);
            this.header.setItem(item);
        }
    }

    private refreshPanel(item: UserTreeGridItem) {
        this.userDataContainer.removeChildren();
        this.appendMetadata(item);
    }

    private bindServerEventListeners() {
        const handler: () => void = AppHelper.debounce(this.handleUserItemEvent.bind(this), 250);

        const serverHandler = PrincipalServerEventsHandler.getInstance();

        serverHandler.onUserItemCreated(handler);
        serverHandler.onUserItemDeleted(handler);
        serverHandler.onUserItemUpdated(handler);
    }

    private handleUserItemEvent() {
        const currentItem: UserTreeGridItem = <UserTreeGridItem>this.getItem();
        const isPrincipalSelected: boolean = !!currentItem && currentItem.getType() === UserTreeGridItemType.PRINCIPAL;

        if (isPrincipalSelected) {
            this.refreshPanel(currentItem);
        }
    }

    private appendMetadata(item: UserTreeGridItem): void {
        const principal = item.getPrincipal();
        const type = principal ? principal.getTypeName().toLowerCase() : '';

        if (type) {
            const mainGroup = new ItemDataGroup(i18n(`field.${type}`), type);
            let metaGroups: Q.Promise<ItemDataGroup[]>;

            switch (principal.getType()) {
            case PrincipalType.USER:
                metaGroups = this.createUserMetadataGroups(principal as User, mainGroup);
                break;
            case PrincipalType.GROUP:
                metaGroups = this.createGroupMetadataGroups(principal as Group, mainGroup);
                break;
            case PrincipalType.ROLE:
                metaGroups = this.createRoleMetadataGroups(principal as Role, mainGroup);
                break;
            }

            metaGroups.then((groups: ItemDataGroup[]) => {
                this.userDataContainer.removeChildren();
                this.userDataContainer.appendChildren(...groups);
            }).catch((reason: any) => {
                DefaultErrorHandler.handle(reason);
            }).done();
        }
    }

    private createUserMetadataGroups(principal: Principal, mainGroup: ItemDataGroup): Q.Promise<ItemDataGroup[]> {
        const membershipsGroup = new ItemDataGroup(i18n('field.rolesAndGroups'), 'memberships');

        return this.fetchPrincipal(principal.getKey()).then((user: Principal) => {
            const memberships = (user as User).getMemberships();
            mainGroup.addDataList(i18n('field.email'), (user as User).getEmail());
            this.appendTransitiveSwitch(principal.getKey(), membershipsGroup, memberships.length > 0);
            this.appendRolesAndGroups(memberships, membershipsGroup);

            return this.addReportGroup(principal, [mainGroup, membershipsGroup]);
        });
    }

    private createGroupMetadataGroups(principal: Principal, mainGroup: ItemDataGroup): Q.Promise<ItemDataGroup[]> {
        this.addMainGroupDescription(principal, mainGroup);

        return this.fetchPrincipal(principal.getKey()).then((group: Principal) => {
            const membershipsGroup = this.createMembershipsGroup(group as Group);
            return this.createMembersGroup(group as Group)
                .then(membersGroup => this.addReportGroup(group, [mainGroup, membershipsGroup, membersGroup]));
        });
    }

    private createRoleMetadataGroups(principal: Principal, mainGroup: ItemDataGroup): Q.Promise<ItemDataGroup[]> {
        this.addMainGroupDescription(principal, mainGroup);

        return this.fetchPrincipal(principal.getKey()).then((role: Principal) => {
            return this.createMembersGroup(role as Role)
                .then(membersGroup => this.addReportGroup(role, [mainGroup, membersGroup]));
        });
    }

    private addMainGroupDescription(principal: Principal, mainGroup: ItemDataGroup): void {
        mainGroup.appendChild(new DivEl('description').setHtml(principal.getDescription()));
    }

    private createMembershipsGroup(group: Group): ItemDataGroup {
        const memberships = group.getMemberships();
        const membershipsGroup = new ItemDataGroup(i18n('field.rolesAndGroups'), 'memberships');

        this.appendTransitiveSwitch(group.getKey(), membershipsGroup, memberships.length > 0);

        this.appendRolesAndGroups(memberships, membershipsGroup);

        return membershipsGroup;
    }

    private createMembersGroup(groupOrRole: Group | Role): Q.Promise<ItemDataGroup> {
        const membersGroup = new ItemDataGroup(i18n('field.members'), 'members');

        const membersKeys = groupOrRole.getMembers();
        const totalMembers = membersKeys.length;
        // Make sure we don't have < 10 members to loader later
        // Otherwise just load them all at once
        const minMembersToLoadLater = 10;
        const hasMoreMembers = totalMembers > UserItemStatisticsPanel.BATCH_SIZE + minMembersToLoadLater;
        const membersToLoad = hasMoreMembers ? membersKeys.slice(0, UserItemStatisticsPanel.BATCH_SIZE) : membersKeys;

        return this.getMembersByKeys(membersToLoad).then((principals) => {
            const dataElements: Element[] = principals.map(el => UserItemStatisticsPanel.createPrincipalViewer(el));

            if (hasMoreMembers) {
                const remainedMembers = membersKeys.slice(UserItemStatisticsPanel.BATCH_SIZE);

                const loadMoreButton = new Button(i18n('action.loadMore', remainedMembers.length));
                loadMoreButton.addClass('principal-button large');
                loadMoreButton.onClicked(() => {
                    loadMoreButton.setEnabled(false);
                    loadMoreButton.addClass('loading icon-spinner');
                    void this.getMembersByKeys(remainedMembers).then((remainingPrincipals) => {
                        membersGroup.clearList();
                        const allPrincipals = [...principals, ...remainingPrincipals];
                        membersGroup.addDataElements(null, allPrincipals.map(el => UserItemStatisticsPanel.createPrincipalViewer(el)));
                    });
                });

                dataElements.push(loadMoreButton);
            }

            membersGroup.addDataElements(null, dataElements);

            return membersGroup;
        });
    }

    private getMembersByKeys(keys: PrincipalKey[]): Q.Promise<Principal[]> {
        if (!keys || keys.length === 0) {
            return Q([]);
        } else {
            return new GetPrincipalsByKeysRequest(keys).sendAndParse();
        }
    }

    private addReportGroup(principal: Principal, groups: ItemDataGroup[]): Q.Promise<ItemDataGroup[]> {
        return new IsAuthenticatedRequest().sendAndParse().then((loginResult: LoginResult) => {
            const isAdmin = loginResult.getPrincipals().some(key => key.equals(RoleKeys.ADMIN));
            if (isAdmin) {
                const reportGroup = this.createReportGroup(principal);
                groups.push(reportGroup);
            }

            return groups;
        });
    }

    private createReportGroup(principal: Principal): ItemDataGroup {
        const reportsGroup = new ItemDataGroup(i18n('field.report'), 'reports');

        const reportsCombo = new RepositoryComboBox();
        reportsCombo.onOptionSelected(() => {
            if (!genButton.isEnabled()) {
                genButton.setEnabled(true);
            }
        });
        reportsCombo.onOptionDeselected(() => {
            if (reportsCombo.getSelectedValues().length === 0) {
                genButton.setEnabled(false);
            }
        });

        const genButton = new Button(i18n('action.report.generate'));
        genButton.setEnabled(false)
            .addClass('principal-button large')
            .onClicked(() => {
                const branches = reportsCombo.getSelectedBranches();
                const repos = reportsCombo.getSelectedDisplayValues();
                repos.forEach((repo: Repository, index: number) => {
                    reportsCombo.deselect(repo);
                    this.downloadReport(principal, repo, branches[index]);
                });
            });

        const comboAndButton = new DivEl();
        comboAndButton.appendChildren<Element>(reportsCombo, genButton);

        reportsGroup.addDataElements(i18n('field.repository.select'), [comboAndButton]);

        return reportsGroup;
    }

    private downloadReport(principal: Principal, repo: Repository, branch: string): void {
        const params: { [name: string]: string } = {
            principalKey: principal.getKey().toString(),
            repositoryId: repo.getId(),
            branch
        };
        const uri: string = UriHelper.appendUrlParams(this.getReportServicePath(), params);
        const reportName: string = `perm-report-${repo.getName()}(${branch}).csv`;

        this.clickFakeElementForReportDownload(uri, reportName);
    }

    private getReportServicePath(): string {
        if (!this.reportServicePath) {
            this.reportServicePath = Path.fromString(window['CONFIG'] && window['CONFIG']['reportServiceUrl']).toString();
        }

        return this.reportServicePath;
    }

    private clickFakeElementForReportDownload(uri: string, fileName: string): void {
        const element: HTMLElement = document.createElement('a');
        element.setAttribute('href', uri);
        element.setAttribute('download', fileName);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    private getMembershipViews(memberships: Principal[], membershipCheck: (p: Principal) => boolean) {
        return memberships
            .sort((item1, item2) => Number(item1.getDisplayName() > item2.getDisplayName()))
            .filter(el => membershipCheck(el))
            .map(el => UserItemStatisticsPanel.createPrincipalViewer(el));
    }

    private appendRolesAndGroups(memberships: Principal[], group: ItemDataGroup) {
        const roleViews = this.getMembershipViews(memberships, p => p.isRole());
        const groupViews = this.getMembershipViews(memberships, p => p.isGroup());

        group.addDataElements(i18n('field.roles'), roleViews);
        group.addDataElements(i18n('field.groups'), groupViews);
    }

    private fetchPrincipal(pKey: PrincipalKey, transitiveMemberships?: boolean) {
        return new GetPrincipalByKeyRequest(pKey)
            .setIncludeMemberships(true)
            .setTransitiveMemberships(transitiveMemberships)
            .sendAndParse();
    }

    private appendTransitiveSwitch(pKey: PrincipalKey, dataGroup: ItemDataGroup, enabled: boolean) {
        const transitiveSwitch = new CheckboxBuilder()
            .setLabelText(i18n('field.transitiveMemberships'))
            .build();
        transitiveSwitch.setEnabled(enabled);
        transitiveSwitch.addClass('transitive-switch');
        transitiveSwitch.onValueChanged(event => {
            this.fetchPrincipal(pKey, 'true' === event.getNewValue()).then(updatedP => {
                const updatedMemberships = (<Group | User>updatedP).getMemberships();
                dataGroup.clearList();
                this.appendRolesAndGroups(updatedMemberships, dataGroup);
            }).catch(DefaultErrorHandler.handle);
        });
        dataGroup.getHeader().appendChild(transitiveSwitch);
    }

    clearItem(): void {
        super.clearItem();
        this.header.setItem(null);
    }
}
