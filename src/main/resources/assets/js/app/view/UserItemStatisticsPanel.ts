import Q from 'q';
import {UserTreeGridItem, UserTreeGridItemType} from '../browse/UserTreeGridItem';
import {GetPrincipalByKeyRequest} from '../../graphql/principal/GetPrincipalByKeyRequest';
import {RepositoryComboBox} from '../report/RepositoryComboBox';
import {User} from '../principal/User';
import {Group} from '../principal/Group';
import {Role} from '../principal/Role';
import {Repository} from '../report/Repository';
import {PrincipalServerEventsHandler} from '../event/PrincipalServerEventsHandler';
import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';
import {ItemDataGroup} from '@enonic/lib-admin-ui/app/view/ItemDataGroup';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {PrincipalViewer} from '@enonic/lib-admin-ui/ui/security/PrincipalViewer';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {AppHelper} from '@enonic/lib-admin-ui/util/AppHelper';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {UriHelper} from '@enonic/lib-admin-ui/util/UriHelper';
import {CheckboxBuilder} from '@enonic/lib-admin-ui/ui/Checkbox';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {UserItemStatisticsHeader} from './UserItemStatisticsHeader';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {MembersListing} from './MembersListing';
import {SelectionChange} from '@enonic/lib-admin-ui/util/SelectionChange';
import {AuthHelper} from '@enonic/lib-admin-ui/auth/AuthHelper';

export class UserItemStatisticsPanel
    extends ItemStatisticsPanel {

    private readonly userDataContainer: DivEl;

    private reportServicePath: string;

    private readonly header: UserItemStatisticsHeader;

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
        serverHandler.onUserItemUpdated(handler);
    }

    private handleUserItemEvent() {
        const currentItem: UserTreeGridItem = this.getItem() as UserTreeGridItem;
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
            let metaGroups: Q.Promise<(ItemDataGroup | MembersListing)[]>;

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
                let groupsToAppend = groups;
                const principalType = principal.getType();
                const principalDescription = principal.getDescription();

                // If Group or Role doesn't have a description, then there's no need to show main group.
                if((principalType === PrincipalType.GROUP || principalType === PrincipalType.ROLE) && !principalDescription){
                    groupsToAppend = groups.slice(1);
                }

                this.userDataContainer.removeChildren();
                this.userDataContainer.appendChildren(...groupsToAppend);
            }).catch((reason) => {
                DefaultErrorHandler.handle(reason);
            }).done();
        }
    }

    private createUserMetadataGroups(principal: Principal, mainGroup: ItemDataGroup): Q.Promise<(ItemDataGroup)[]> {
        const membershipsGroup = new ItemDataGroup(i18n('field.rolesAndGroups'), 'memberships');

        return this.fetchPrincipal(principal.getKey()).then(async (user: Principal) => {
            const memberships = (user as User).getMemberships();
            mainGroup.addDataList(i18n('field.email'), (user as User).getEmail());
            this.appendTransitiveSwitch(principal.getKey(), membershipsGroup, memberships.length > 0);
            this.appendRolesAndGroups(memberships, membershipsGroup);
            const reportGroup = await this.createReportGroup(principal);
            return [mainGroup, membershipsGroup, reportGroup].filter(group => !!group);
        });
    }

    private createGroupMetadataGroups(principal: Principal, mainGroup: ItemDataGroup): Q.Promise<(ItemDataGroup | MembersListing)[]> {
        this.addMainGroupDescriptionIfExists(principal, mainGroup);

        return this.fetchPrincipal(principal.getKey()).then(async (group: Principal) => {
            const membershipsGroup = this.createMembershipsGroup(group as Group);
            const membersGroup = this.createMembersGroup(group as Group);
            const reportGroup = await this.createReportGroup(principal);
            return [mainGroup, reportGroup, membershipsGroup, membersGroup].filter(group => !!group);
        });
    }

    private createRoleMetadataGroups(principal: Principal, mainGroup: ItemDataGroup): Q.Promise<(ItemDataGroup | MembersListing)[]> {
        this.addMainGroupDescriptionIfExists(principal, mainGroup);

        return this.fetchPrincipal(principal.getKey()).then(async (role: Principal) => {
            const membersGroup = this.createMembersGroup(role as Role);
            const reportGroup = await this.createReportGroup(principal);
            return [mainGroup, reportGroup, membersGroup].filter(group => !!group);
        });
    }

    private addMainGroupDescriptionIfExists(principal: Principal, mainGroup: ItemDataGroup): void {
        if(principal.getDescription()) {
            mainGroup.appendChild(new DivEl('description').setHtml(principal.getDescription()));
        }
    }

    private createMembershipsGroup(group: Group): ItemDataGroup {
        const memberships = group.getMemberships();
        const membershipsGroup = new ItemDataGroup(i18n('field.rolesAndGroups'), 'memberships');

        this.appendTransitiveSwitch(group.getKey(), membershipsGroup, memberships.length > 0);

        this.appendRolesAndGroups(memberships, membershipsGroup);

        return membershipsGroup;
    }

    private createMembersGroup(groupOrRole: Group | Role): MembersListing {
        const memberKeys = groupOrRole.getMembers();
        const membersListing = new MembersListing(i18n('field.members') + ` (${memberKeys.length})`, 'members item-data-group');
        membersListing.setParent(this);
        membersListing.setMembersKeys(memberKeys);
        membersListing.populateList();
        return membersListing;
    }

    private async createReportGroup(principal: Principal): Promise<ItemDataGroup | null> {
        const isAdmin = AuthHelper.isAdmin();

        if(!isAdmin) { return Q(null); }

        const reportsGroup = new ItemDataGroup(i18n('field.report'), 'reports');
        const reportsCombo = new RepositoryComboBox();

        reportsCombo.onSelectionChanged((selectionChange: SelectionChange<Repository>) => {
           if (selectionChange.selected?.length > 0) {
               genButton.setEnabled(true);
           }

           if (selectionChange.deselected?.length > 0) {
               if (reportsCombo.getSelectedOptions().length === 0) {
                   genButton.setEnabled(false);
               }
           }
        });

        const genButton = new Button(i18n('action.report.generate'));
        genButton.setEnabled(false)
            .addClass('principal-button large')
            .onClicked(() => {
                const branches = reportsCombo.getSelectedBranches();
                const repos = reportsCombo.getSelectedOptions().map(option => option.getOption().getDisplayValue());
                repos.forEach((repo: Repository, index: number) => {
                    reportsCombo.deselect(repo);
                    this.downloadReport(principal, repo, branches[index]);
                });
            });

        const comboAndButton = new DivEl('reports-combo-and-button');
        comboAndButton.appendChildren<Element>(reportsCombo, genButton);

        reportsGroup.addDataElements(i18n('field.repository.select'), [comboAndButton]);

        return Q(reportsGroup);
    }

    private downloadReport(principal: Principal, repo: Repository, branch: string): void {
        const params: Record<string, string> = {
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
            this.reportServicePath = Path.fromString(CONFIG.getString('apis.reportServiceUrl')).toString();
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
                const updatedMemberships = (updatedP as Group | User).getMemberships();
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
