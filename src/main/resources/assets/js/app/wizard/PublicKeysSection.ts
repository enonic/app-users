import {FormItemEl} from '@enonic/lib-admin-ui/dom/FormItemEl';
import {PublicKeysGrid} from '../view/PublicKeysGrid';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {User} from '../principal/User';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {NewPublicKeyDialog} from './NewPublicKeyDialog';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';

export class PublicKeysSection
    extends FormItemEl {

    private publicKeysGrid: PublicKeysGrid;

    private addPublicKeyButton: Button;

    private user?: User;

    private publicKeysHelpTextBlock: DivEl;

    constructor(user?: User) {
        super('div', 'public-keys-section');

        this.user = user;
    }

    initialize(): void {
        this.initElements();
        this.initListeners();
    }

    private initElements(): void {
        this.publicKeysHelpTextBlock = new DivEl('help-text-block');
        this.publicKeysHelpTextBlock.setHtml(i18n('text.users.publicKeysHelpText'));
        this.publicKeysHelpTextBlock.setVisible(!this.user);

        this.addPublicKeyButton = new Button(i18n('action.add'));
        this.addPublicKeyButton.setVisible(!!this.user);

        this.publicKeysGrid = new PublicKeysGrid();
        this.publicKeysGrid.setVisible(this.hasUserPublicKeys());
    }

    private initListeners(): void {
        this.addPublicKeyButton.onClicked(() => {
            if (!!this.user) {
                const publicKeysDialog = new NewPublicKeyDialog(this.user);
                publicKeysDialog.open();
            }
        });
    }

    private hasUserPublicKeys(): boolean {
        return this.user?.getPublicKeys().length > 0;
    }

    updateView(user: User) {
        this.user = user;

        if (!!this.user) {
            this.publicKeysHelpTextBlock.setVisible(false);
            this.addPublicKeyButton.setVisible(true);
            this.publicKeysGrid.setUser(this.user);
            this.publicKeysGrid.setVisible(this.hasUserPublicKeys());
        }
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.publicKeysHelpTextBlock);
            this.appendChild(this.publicKeysGrid);
            this.appendChild(this.addPublicKeyButton);

            return rendered;
        });
    }

}
