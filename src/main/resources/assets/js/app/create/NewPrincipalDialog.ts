import {UserItemTypesTreeGrid} from './UserItemTypesTreeGrid';
import {NewPrincipalEvent} from '../browse/NewPrincipalEvent';
import {UserTreeGridItem, UserTreeGridItemType} from '../browse/UserTreeGridItem';
import {ResponsiveManager} from 'lib-admin-ui/ui/responsive/ResponsiveManager';
import {PEl} from 'lib-admin-ui/dom/PEl';
import {i18n} from 'lib-admin-ui/util/Messages';
import {Body} from 'lib-admin-ui/dom/Body';
import {ModalDialog, ModalDialogConfig} from 'lib-admin-ui/ui/dialog/ModalDialog';

export class NewPrincipalDialog
    extends ModalDialog {
    private grid: UserItemTypesTreeGrid;

    private pathEl: PEl;

    constructor() {
        super(<ModalDialogConfig>{
            title: i18n('dialog.new'),
            class: 'new-principal-dialog'
        });
    }

    protected initElements() {
        super.initElements();

        this.grid = new UserItemTypesTreeGrid();
    }

    protected initListeners() {
        super.initListeners();

        this.grid.onDataChanged(() => ResponsiveManager.fireResizeEvent());
        NewPrincipalEvent.on(() => this.isVisible() && this.close());
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.addCancelButtonToBottom(null, true);
            this.getContentPanel().appendChild(this.grid);

            return rendered;
        });
    }

    setSelection(selection: UserTreeGridItem[]): NewPrincipalDialog {
        const isidProvider = selection.length === 1 && selection[0].getType() === UserTreeGridItemType.ID_PROVIDER;
        if (isidProvider) {
            this.grid.setIdProvider(selection[0].getIdProvider());
            this.setPath(selection[0].getItemDisplayName());
        } else if (this.pathEl) {
            this.pathEl.hide();
        }
        return this;
    }

    open() {
        this.grid.reload();
        this.grid.getGrid().resizeCanvas();
        Body.get().appendChild(this);
        super.open();
    }

    close() {
        this.grid.clearidProviders();
        super.close();
        this.remove();
    }

    private createPathEl(): PEl {
        const pathEl = new PEl('path');
        pathEl.getEl().setAttribute('data-desc', `${i18n('dialog.newContent.pathDescription')}:`);
        this.header.appendChild(pathEl);

        return pathEl;
    }

    private setPath(path: string) {
        if (!this.pathEl) {
            this.pathEl = this.createPathEl();
        }
        this.pathEl.setHtml(path);
        this.pathEl.show();
    }
}
