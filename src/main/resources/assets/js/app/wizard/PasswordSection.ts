import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {User} from '../principal/User';
import {PasswordGenerator} from './PasswordGenerator';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {OpenChangePasswordDialogEvent} from './OpenChangePasswordDialogEvent';
import {ConfirmationDialog} from '@enonic/lib-admin-ui/ui/dialog/ConfirmationDialog';
import {UpdatePasswordRequest} from '../../graphql/principal/user/UpdatePasswordRequest';
import {showFeedback} from '@enonic/lib-admin-ui/notify/MessageBus';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {FormItemEl} from '@enonic/lib-admin-ui/dom/FormItemEl';
import {SetPasswordButtonClickedEvent} from './SetPasswordButtonClickedEvent';

export class PasswordSection
    extends FormItemEl {

    private password: PasswordGenerator;

    private setOrChangePasswordButton: Button;

    private clearPasswordButton: Button;

    private user?: User;

    constructor(user?: User) {
        super('div', 'password-button-group');

        this.user = user;
    }

    initialize(): void {
        this.initElements();
        this.initListeners();
    }

    private isNewUserOrUserWithoutPassword(): boolean {
        return !this.user?.hasPassword();
    }

    private isUserWithPassword(): boolean {
        return this.user?.hasPassword();
    }

    private initElements(): void {
        this.password = new PasswordGenerator();
        this.password.setVisible(false);

        this.setOrChangePasswordButton =
            new Button(i18n(this.isNewUserOrUserWithoutPassword() ? 'action.setPassword' : 'action.changePassword'));
        this.setOrChangePasswordButton.addClass('change-password-button');

        this.clearPasswordButton = new Button(i18n('action.clearPassword'));
        this.clearPasswordButton.setVisible(this.isUserWithPassword());
    }

    private initListeners(): void {
        this.setOrChangePasswordButton.onClicked(() => {
            if (this.isNewUserOrUserWithoutPassword()) {
                new SetPasswordButtonClickedEvent(true).fire();
                this.password.setVisible(true);
                this.setOrChangePasswordButton.setVisible(false);
            } else {
                new OpenChangePasswordDialogEvent(this.user).fire();
            }
        });

        this.clearPasswordButton.onClicked(() => {
            if (this.isUserWithPassword()) {
                new ConfirmationDialog()
                    .setQuestion(i18n('dialog.clearPassword.question'))
                    .setNoCallback(null)
                    .setYesCallback(() => {
                        new UpdatePasswordRequest()
                            .setPassword(null)
                            .setKey(this.user.getKey())
                            .sendAndParse()
                            .then(() => {
                                showFeedback(i18n('notify.clear.password'));
                            })
                            .catch(DefaultErrorHandler.handle);
                    }).open();
            }
        });
    }

    getPassword(): string {
        return this.password.getValue();
    }

    updateView(user: User): void {
        this.user = user;

        if (!!this.user) {
            this.password.reset();
            this.password.setVisible(false);
            this.setOrChangePasswordButton.setVisible(true);
            this.setOrChangePasswordButton.setLabel(i18n(this.isUserWithPassword() ? 'action.changePassword' : 'action.setPassword'));
            this.clearPasswordButton.setVisible(this.isUserWithPassword());
        }
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.password);

            const buttonsWrapper = new DivEl('password-buttons-wrapper');
            buttonsWrapper.appendChildren(this.setOrChangePasswordButton, this.clearPasswordButton);
            this.appendChild(buttonsWrapper);

            return rendered;
        });
    }
}
