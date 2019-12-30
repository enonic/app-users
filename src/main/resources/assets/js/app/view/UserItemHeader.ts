import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {H2El} from 'lib-admin-ui/dom/H2El';
import {H3El} from 'lib-admin-ui/dom/H3El';

export class UserItemHeader
    extends DivEl {
    private displayName: H2El;
    private subTitle: H3El;

    constructor() {
        super('principal-item-header');

        this.displayName = new H2El();
        this.subTitle = new H3El();

        this.appendChild(this.displayName);
        this.appendChild(this.subTitle);

    }

    setTitle(value: string) {
        this.displayName.getEl().setInnerHtml(value);
    }

    setSubTitle(value: string) {
        this.subTitle.getEl().setInnerHtml(value);
    }
}
