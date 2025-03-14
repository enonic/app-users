import {UserItemTypesTreeGrid} from './UserItemTypesTreeGrid';
import {NewPrincipalEvent} from '../browse/NewPrincipalEvent';
import {UserTreeGridItem, UserTreeGridItemType} from '../browse/UserTreeGridItem';
import {PEl} from '@enonic/lib-admin-ui/dom/PEl';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {ModalDialog, ModalDialogConfig} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {KeyBinding} from '@enonic/lib-admin-ui/ui/KeyBinding';

export class NewPrincipalDialog
    extends ModalDialog {
    private grid: UserItemTypesTreeGrid;

    private pathEl: PEl;

    constructor() {
        super({
            title: i18n('dialog.new'),
            class: 'new-principal-dialog'
        } as ModalDialogConfig);
    }

    protected initElements(): void {
        super.initElements();

        this.grid = new UserItemTypesTreeGrid();
        this.addCancelButtonToBottom(null, true);
    }

    protected initListeners(): void {
        super.initListeners();

        NewPrincipalEvent.on(() => this.isVisible() && this.close());
    }

    protected postInitElements(): void {
        super.postInitElements();

        this.setElementToFocusOnShow(this.getCancelButton());
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.getContentPanel().appendChild(this.grid);

            return rendered;
        });
    }

    setSelection(selection: UserTreeGridItem[]): NewPrincipalDialog {
        const isIdProvider: boolean = selection.length === 1 && selection[0].getType() === UserTreeGridItemType.ID_PROVIDER;

        if (isIdProvider) {
            this.grid.setIdProvider(selection[0].getIdProvider());
            this.setPath(selection[0].getItemDisplayName());
        } else if (this.pathEl) {
            this.pathEl.hide();
        }
        return this;
    }

    protected addKeyBindings(): KeyBinding[] {
        return [];
    }

    open(): void {
        this.grid.load();
        Body.get().appendChild(this);
        super.open();
    }

    close(): void {
        this.grid.reset();
        super.close();
        this.remove();
    }

    private createPathEl(): PEl {
        const pathEl: PEl = new PEl('path');
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
