import {OpenChangePasswordDialogEvent} from './OpenChangePasswordDialogEvent';
import {SetUserPasswordRequest} from './SetUserPasswordRequest';
import {PasswordGenerator} from './PasswordGenerator';
import {Principal} from 'lib-admin-ui/security/Principal';
import {DialogButton} from 'lib-admin-ui/ui/dialog/DialogButton';
import {Validators} from 'lib-admin-ui/ui/form/Validators';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {ModalDialog} from 'lib-admin-ui/ui/dialog/ModalDialog';
import {H6El} from 'lib-admin-ui/dom/H6El';
import {i18n} from 'lib-admin-ui/util/Messages';
import {FormItemBuilder} from 'lib-admin-ui/ui/form/FormItem';
import {Fieldset} from 'lib-admin-ui/ui/form/Fieldset';
import {Form} from 'lib-admin-ui/ui/form/Form';
import {showFeedback} from 'lib-admin-ui/notify/MessageBus';
import {Action} from 'lib-admin-ui/ui/Action';

export class ChangeUserPasswordDialog
    extends ModalDialog {

    private password: PasswordGenerator;

    private principal: Principal;

    private changePasswordButton: DialogButton;

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

        this.changePasswordButton = this.addAction(new Action(i18n('action.changePassword'), '').onExecuted(() => {
            new SetUserPasswordRequest().setKey(this.principal.getKey()).setPassword(
                this.password.getValue()).sendAndParse().then(() => {
                showFeedback(i18n('notify.change.password'));
                this.close();
            }).catch(DefaultErrorHandler.handle);
        }));
        this.changePasswordButton.setEnabled(false);
    }

    private toggleChangePasswordButton() {
        this.changePasswordButton.setEnabled(this.password.isValid());
    }

    open() {
        super.open();
    }

    show() {
        this.password.reset();
        super.show();
    }

    close() {
        super.close();
        this.remove();
    }

    getPrincipal(): Principal {
        return this.principal;
    }

}
