import {WizardPanel} from 'lib-admin-ui/app/wizard/WizardPanel';
import {ModalDialog} from 'lib-admin-ui/ui/dialog/ModalDialog';
import {Action} from 'lib-admin-ui/ui/Action';
import {i18n} from 'lib-admin-ui/util/Messages';
import {H6El} from 'lib-admin-ui/dom/H6El';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {Body} from 'lib-admin-ui/dom/Body';

export class SaveBeforeCloseDialog extends ModalDialog {

    private wizardPanel: WizardPanel<any>;

    private yesAction: Action = new Action(i18n('action.yes'), i18n('action.yes').slice(0, 1).toLowerCase());

    private noAction: Action = new Action(i18n('action.no'), i18n('action.no').slice(0, 1).toLowerCase());

    constructor(wizardPanel: WizardPanel<any>) {
        super({title: i18n('dialog.saveBeforeClose.title')});

        this.wizardPanel = wizardPanel;

        let message = new H6El();
        message.getEl().setInnerHtml(i18n('dialog.saveBeforeClose.msg'));
        this.appendChildToContentPanel(message);

        this.yesAction.setMnemonic(i18n('action.yes').slice(0, 1).toLowerCase());
        this.yesAction.onExecuted(() => {
            this.doSaveAndClose();
        });
        this.addAction(this.yesAction, true);

        this.noAction.setMnemonic(i18n('action.no').slice(0, 1).toLowerCase());
        this.noAction.onExecuted(() => {
            this.doCloseWithoutSaveCheck();
        });
        this.addAction(this.noAction);

        this.getCancelAction().setMnemonic('c');
    }

    show() {
        Body.get().appendChild(this);
        super.show();
    }

    close() {
        this.remove();
        super.close();
    }

    private doSaveAndClose() {
        this.close();
        this.wizardPanel.saveChanges()
            .then(() => this.wizardPanel.close(true))
            .catch(reason => DefaultErrorHandler.handle(reason));
    }

    private doCloseWithoutSaveCheck() {

        this.close();
        this.wizardPanel.close();
    }

}
