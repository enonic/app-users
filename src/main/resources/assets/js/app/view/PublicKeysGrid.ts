import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {AEl} from '@enonic/lib-admin-ui/dom/AEl';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ConfirmationDialog} from '@enonic/lib-admin-ui/ui/dialog/ConfirmationDialog';
import {PublicKey} from '../browse/serviceaccount/PublicKey';
import {User} from '../principal/User';
import {DeletePublicKeyRequest} from '../../graphql/principal/user/DeletePublicKeyRequest';
import {UserKeyDetailsDialog} from '../wizard/UserKeyDetailsDialog';
import {DateHelper} from '@enonic/lib-admin-ui/util/DateHelper';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';

export class PublicKeysGrid
    extends DivEl {

    private static GRID_CSS_STYLE = 'public-keys-grid';

    private readonly tbody: DivEl;

    constructor(className ?: string) {
        super(className || '');

        this.getEl().addClass(PublicKeysGrid.GRID_CSS_STYLE);

        const header = this.createHeaderRow();

        this.tbody = this.createDivEl(`${PublicKeysGrid.GRID_CSS_STYLE}-body`);

        const container: DivEl = this.createDivEl(`${PublicKeysGrid.GRID_CSS_STYLE}-container`, 'table');
        container.appendChild(header);
        container.appendChild(this.tbody);

        this.appendChild(container);
    }

    setUser(user: User): void {
        this.tbody.removeChildren();
        user.getPublicKeys().forEach((publicKey: PublicKey) => {
            this.addPublicKey(user, publicKey);
        });
    }

    addPublicKey(user: User, publicKey: PublicKey): void {
        const row = this.createRow();
        row.appendChild(this.createKidCell(publicKey));
        row.appendChild(this.createCell(publicKey.getLabel()));

        const creationTime = new Date(Date.parse(publicKey.getCreationTime()));
        row.appendChild(this.createCell(DateHelper.formatDateTime(creationTime)));

        row.appendChild(this.createActionCell(user, publicKey, row));

        this.tbody.appendChild(row);
    }

    private createHeaderRow(): DivEl {
        const header = this.createRow();

        header.appendChild(this.createHeader(i18n('field.userKeys.grid.kid.column')));
        header.appendChild(this.createHeader(i18n('field.userKeys.grid.label.column')));
        header.appendChild(this.createHeader(i18n('field.userKeys.grid.creationTime.column')));
        header.appendChild(this.createHeader(i18n('field.userKeys.grid.actions.column')));

        return header;
    }

    private createHeader(text: string): DivEl {
        const header = this.createDivEl(`${PublicKeysGrid.GRID_CSS_STYLE}-header`, 'columnheader');
        header.setHtml(text);
        return header;
    }

    private createRow(): DivEl {
        return this.createDivEl(`${PublicKeysGrid.GRID_CSS_STYLE}-row`, 'rowgroup');
    }

    private createCell(text?: string): DivEl {
        return this.createDivEl(`${PublicKeysGrid.GRID_CSS_STYLE}-cell`, 'cell', text);
    }

    private createKidCell(publicKey: PublicKey): DivEl {
        const cell = this.createCell();
        const showKidLink = this.createShowButton(publicKey);
        cell.appendChild(showKidLink);
        return cell;
    }

    private createActionCell(user: User, publicKey: PublicKey, rowEl: DivEl): DivEl {
        const actionCell = this.createCell();
        const removeButton = this.createRemoveButton(user, publicKey, rowEl);
        actionCell.appendChild(removeButton);
        return actionCell;
    }

    private createShowButton(publicKey: PublicKey): AEl {
        const showButton = new AEl('show-public-key');
        showButton.setHtml(publicKey.getKid());
        showButton.onClicked((event: MouseEvent) => {
            event.stopPropagation();
            event.preventDefault();
            new UserKeyDetailsDialog(publicKey.getPublicKey()).open();
            return false;
        });
        return showButton;
    }

    private createRemoveButton(user: User, publicKey: PublicKey, rowEl: DivEl): AEl {
        const removeButton = new AEl('remove-public-key icon-close');
        removeButton.onClicked((event: MouseEvent) => {
            event.stopPropagation();
            event.preventDefault();

            const confirmation = new ConfirmationDialog()
                .setQuestion(i18n('dialog.delete.question'))
                .setNoCallback(null)
                .setYesCallback(() => {
                    new DeletePublicKeyRequest().setKey(user.getKey()).setKid(publicKey.getKid()).sendAndParse().then((removed) => {
                        if (removed) {
                            rowEl.remove();
                        }
                    }).catch((reason: Error) => {
                        DefaultErrorHandler.handle(reason);
                    });
                });
            confirmation.open();

            return false;
        });
        return removeButton;
    }

    private createDivEl(className?: string, role?: string, html?: string): DivEl {
        const divEl = new DivEl(className || '');
        if (role) {
            divEl.getEl().setAttribute('role', role);
        }
        if (html) {
            divEl.setHtml(html);
        }
        return divEl;
    }

}
