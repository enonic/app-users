import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {TextArea} from '@enonic/lib-admin-ui/ui/text/TextArea';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';

export class UserKeyDetailsDialog
    extends ModalDialog {

    constructor(value: string) {
        super({
            title: i18n('dialog.userKeyDetails.title')
        });

        this.getEl().addClass('show-public-key-dialog');

        const publicKey = new TextArea('public-key', value);
        this.appendChildToContentPanel(publicKey);
        this.addCancelButtonToBottom(i18n('dialog.userKeyDetails.closeBtn'));
    }

    close(): void {
        super.close();
        this.remove();
    }

}
