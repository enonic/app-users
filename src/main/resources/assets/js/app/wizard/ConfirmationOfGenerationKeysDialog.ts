import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';

export class ConfirmationOfGenerationKeysDialog
    extends ModalDialog {

    constructor(filename: string) {
        super({
            title: i18n('dialog.userKeysGenerated.title')
        });
        this.getEl().addClass('confirmation-of-generation-keys-dialog');
        const informationText: DivEl = new DivEl('information-text-section');
        informationText.setHtml(i18n('dialog.userKeysGenerated.msg', filename));
        this.appendChildToContentPanel(informationText);
        this.addCancelButtonToBottom(i18n('dialog.userKeysGenerated.closeBtn'));
    }

    close(): void {
        super.close();
        this.remove();
    }

}
