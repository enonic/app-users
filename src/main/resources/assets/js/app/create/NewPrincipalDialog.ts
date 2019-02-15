import '../../api.ts';
import {UserItemTypesTreeGrid} from './UserItemTypesTreeGrid';
import {NewPrincipalEvent} from '../browse/NewPrincipalEvent';
import {UserTreeGridItem, UserTreeGridItemType} from '../browse/UserTreeGridItem';
import i18n = api.util.i18n;
import ResponsiveManager = api.ui.responsive.ResponsiveManager;

export class NewPrincipalDialog extends api.ui.dialog.ModalDialog {
    private grid: UserItemTypesTreeGrid;

    private pathEl: api.dom.PEl;

    constructor() {
        super(<api.ui.dialog.ModalDialogConfig>{
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
        this.grid.reload(null, null, false);
        this.grid.getGrid().resizeCanvas();
        api.dom.Body.get().appendChild(this);
        super.open();
    }

    close() {
        this.grid.clearidProviders();
        super.close();
        this.remove();
    }

    private createPathEl(): api.dom.PEl {
        const pathEl = new api.dom.PEl('path');
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
