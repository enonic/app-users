import {OpenChangePasswordDialogEvent} from './OpenChangePasswordDialogEvent';
import {SetUserPasswordRequest} from './SetUserPasswordRequest';
import {PasswordGenerator} from './PasswordGenerator';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {Validators} from '@enonic/lib-admin-ui/ui/form/Validators';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {H6El} from '@enonic/lib-admin-ui/dom/H6El';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {Fieldset} from '@enonic/lib-admin-ui/ui/form/Fieldset';
import {Form} from '@enonic/lib-admin-ui/ui/form/Form';
import {showFeedback} from '@enonic/lib-admin-ui/notify/MessageBus';
import {Action} from '@enonic/lib-admin-ui/ui/Action';

export class ChangeUserPasswordDialog
    extends ModalDialog {

    private password: PasswordGenerator;

    private principal: Principal;

    private changePasswordAction: Action;

    constructor() {
        super({
            title: i18n('dialog.changePassword.title')
        });

        this.getEl().addClass('change-password-dialog');

        const userPath = new H6El().addClass('user-path');
        const descMessage = new H6El().addClass('desc-message').setHtml(i18n('dialog.changePassword.msg'));

        this.appendChildToHeader(userPath);
        this.appendChildToContentPanel(descMessage);

        this.password = new PasswordGenerator();
        this.password.onInput(() => this.toggleChangePasswordButton());
        this.password.onValidityChanged(() => this.toggleChangePasswordButton());

        this.onShown(() => this.toggleChangePasswordButton());

        let passwordFormItem = new FormItemBuilder(this.password)
            .setLabel(i18n('field.password'))
            .setValidator(Validators.required).build();

        let fieldSet = new Fieldset();
        fieldSet.add(passwordFormItem);

        let form = new Form().add(fieldSet);

        this.appendChildToContentPanel(form);
        this.initializeActions();

        OpenChangePasswordDialogEvent.on((event) => {
            this.principal = event.getPrincipal();
            userPath.setHtml(this.principal.getKey().toPath());
            this.open();
        });

        this.addCancelButtonToBottom();
    }

    private initializeActions() {
        this.changePasswordAction = new Action(i18n('action.changePassword'), '')
            .setEnabled(false)
            .onExecuted(() => {
                if (!this.password.isValid()) {
                    return;
                }
                new SetUserPasswordRequest()
                    .setKey(this.principal.getKey())
                    .setPassword(this.password.getValue())
                    .sendAndParse()
                    .then(() => {
                        showFeedback(i18n('notify.change.password'));
                        this.close();
                    })
                    .catch(DefaultErrorHandler.handle);
            });

        this.addAction(this.changePasswordAction);
    }

    private toggleChangePasswordButton() {
        this.changePasswordAction.setEnabled(this.password.isValid());
    }

    open(): void {
        super.open();
    }

    show(): void {
        this.password.reset();
        super.show();
    }

    close(): void {
        super.close();
        this.remove();
    }

    getPrincipal(): Principal {
        return this.principal;
    }

}
