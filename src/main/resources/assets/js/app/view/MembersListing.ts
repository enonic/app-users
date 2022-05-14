import Q = require('q');
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {Element} from 'lib-admin-ui/dom/Element';
import {H2El} from 'lib-admin-ui/dom/H2El';
import {UlEl} from 'lib-admin-ui/dom/UlEl';
import {LiEl} from 'lib-admin-ui/dom/LiEl';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalViewer} from 'lib-admin-ui/ui/security/PrincipalViewer';
import {AppHelper} from 'lib-admin-ui/util/AppHelper';
import {GetPrincipalsByKeysRequest} from '../../graphql/principal/GetPrincipalsByKeysRequest';

export class MembersListing extends DivEl {

    private parent: DivEl;
    private header: H2El;
    private ulList: UlEl;
    private membersKeysChunks: PrincipalKey[][];
    private static CHUNK_SIZE: number = 30;

    constructor(title?: string, className ?: string) {
        super(className || '');

        if(title) {
            this.header = new H2El();
            this.header.getEl().setInnerHtml(title);
            this.appendChild(this.header);
        }

        this.ulList = new UlEl('data-list');
    }

    setParent(parent: Element): void {
        this.parent = parent;

        let chunkIndex = 1;
        const scrollHandler = AppHelper.debounce(async (event:Event) => {
            const element = event.target as HTMLElement;
            const isScrollNearBottom = element.scrollTop >= 0.95 * (element.scrollHeight - element.clientHeight);
            if (isScrollNearBottom && chunkIndex < this.membersKeysChunks.length) {
                await this.populateList(chunkIndex);
                chunkIndex += 1;
            }
        }, 100);

        this.parent.onScroll(scrollHandler);
    }

    setMembersKeys(membersKeys: PrincipalKey[]): void {
        function chunkArray<T>(arr: T[], size: number) {
            return arr.length > size ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)] : [arr];
        }

        this.membersKeysChunks = chunkArray<PrincipalKey>(membersKeys, MembersListing.CHUNK_SIZE);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async populateList(chunkIndex: number = 0) {
        const memberKeys = this.parent
            ? this.membersKeysChunks[chunkIndex]
            : this.membersKeysChunks.reduce((a,b) => a.concat(b));

        const principals = await this.getMembersByKeys(memberKeys);
        const principalsViewer = principals.map(principal => MembersListing.createPrincipalViewer(principal));

        if(this.hasChild(this.ulList)) { this.removeChild(this.ulList); }

        principalsViewer.forEach((pv) => {
            const liEl = new LiEl();
            liEl.appendChild(pv as Element);
            this.ulList.appendChild(liEl);
        });

        this.appendChild(this.ulList);
    }

    private getMembersByKeys(keys: PrincipalKey[]): Q.Promise<Principal[]> {
        if (!keys || keys.length === 0) {
            return Q([]);
        }

        return new GetPrincipalsByKeysRequest(keys).sendAndParse();
    }

    private static createPrincipalViewer(principal: Principal): PrincipalViewer {
        const viewer: PrincipalViewer = new PrincipalViewer();
        viewer.setObject(principal);
        return viewer;
    }
}
