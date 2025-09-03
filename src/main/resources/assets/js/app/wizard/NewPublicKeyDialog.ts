import Q from 'q';
import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {Fieldset} from '@enonic/lib-admin-ui/ui/form/Fieldset';
import {Form} from '@enonic/lib-admin-ui/ui/form/Form';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {TextInput} from '@enonic/lib-admin-ui/ui/text/TextInput';
import {CryptoWorker} from '../../util/CryptoWorker';
import {AddPublicKeyRequest} from '../../graphql/principal/user/AddPublicKeyRequest';
import {User} from '../principal/User';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {showSuccess} from '@enonic/lib-admin-ui/notify/MessageBus';
import {MenuButton, MenuButtonConfig} from '@enonic/lib-admin-ui/ui/button/MenuButton';
import {DropdownButtonRow} from '@enonic/lib-admin-ui/ui/dialog/DropdownButtonRow';
import {Validators} from '@enonic/lib-admin-ui/ui/form/Validators';
import {ValidationResult} from '@enonic/lib-admin-ui/ui/form/ValidationResult';
import {HelpTextContainer} from '@enonic/lib-admin-ui/form/HelpTextContainer';

export class NewPublicKeyDialog
    extends ModalDialog {

    public static DIALOG_CSS_STYLE = 'new-public-key-dialog';

    private user: User;

    private labelTextInput: TextInput;

    private keyUploaderTextInput: TextInput;

    private labelFormItem: FormItem;

    private generateKeyAction: Action;

    private uploadKeyAction: Action;

    constructor(user: User) {
        super({
            title: i18n('dialog.addUserKey.title'),
            class: NewPublicKeyDialog.DIALOG_CSS_STYLE,
            buttonRow: new NewPublicKeyDialogButtonRow(),
        });

        this.user = user;
    }

    protected initElements() {
        super.initElements();

        this.labelTextInput = TextInput.middle();

        this.keyUploaderTextInput = TextInput.middle();
        this.keyUploaderTextInput.setType('file');
        this.keyUploaderTextInput.getHTMLElement().setAttribute('accept', '.pem');
        this.keyUploaderTextInput.hide();

        this.generateKeyAction = new Action(i18n('field.generate')).setEnabled(false);
        this.uploadKeyAction = new Action(i18n('dialog.addUserKey.uploadBtn'));

        const menuButton = this.getButtonRow().makeActionMenu({
            defaultAction: this.generateKeyAction,
            menuActions: [this.uploadKeyAction]
        }, true);

        menuButton.getEl().appendChild(this.keyUploaderTextInput.getHTMLElement());

        this.appendChildToContentPanel(this.createForm());

        this.initActions();
    }

    protected initListeners() {
        super.initListeners();

        this.onShown(() => {
            this.labelFormItem.validate(new ValidationResult(), true);
        });

        this.labelTextInput.onValueChanged(() => {
            this.labelFormItem.validate(new ValidationResult(), true);
        });

        this.labelTextInput.onValidityChanged((event) => {
            if (event.isValid()) {
                this.generateKeyAction.setEnabled(true);
            } else {
                this.generateKeyAction.setEnabled(false);
            }
        });

        this.keyUploaderTextInput.onChange((event) => {
            const file = (this.keyUploaderTextInput.getHTMLElement() as HTMLInputElement).files[0];
            file.text().then((text) => {
                new AddPublicKeyRequest()
                    .setKey(this.user.getKey())
                    .setPublicKey(text)
                    .setLabel(this.labelTextInput.getValue())
                    .sendAndParse()
                    .then((publicKey) => {
                        showSuccess(i18n('dialog.addUserKey.keyUploaded.success', publicKey.getKid()));
                    })
                    .catch((reason: Error) => {
                        DefaultErrorHandler.handle(reason);
                    });
                this.close();
            });
        });
    }

    getButtonRow(): NewPublicKeyDialogButtonRow {
        return super.getButtonRow() as NewPublicKeyDialogButtonRow;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addCancelButtonToBottom();
            return rendered;
        });
    }

    show(): void {
        this.labelTextInput.reset();
        this.keyUploaderTextInput.reset();
        super.show();
    }

    close(): void {
        super.close();
        this.remove();
    }

    private createForm(): Form {
        this.labelFormItem =
            new FormItemBuilder(this.labelTextInput).setLabel(i18n('field.label')).setValidator(Validators.required).build();

        const helpTextContainer = new HelpTextContainer(i18n('dialog.addUserKey.helpText'));
        this.labelFormItem.appendChild(helpTextContainer.getHelpText());
        helpTextContainer.toggleHelpText(true);

        const fieldSet = new Fieldset();
        fieldSet.add(this.labelFormItem);

        const form = new Form();
        form.add(fieldSet);
        return form;
    }

    private initActions() {
        this.generateKeyAction.onExecuted(() => {
            CryptoWorker.getCryptoWorker().postMessage({
                label: this.labelTextInput.getValue(),
            });
            this.close();
        });

        this.uploadKeyAction.onExecuted(() => {
            this.keyUploaderTextInput.getHTMLElement().click();
        });

        CryptoWorker.getCryptoWorker().onmessage = (event) => {
            new AddPublicKeyRequest()
                .setKey(this.user.getKey())
                .setPublicKey(event.data.publicKey)
                .setLabel(this.labelTextInput.getValue())
                .sendAndParse()
                .then((publicKey) => {
                    this.saveKeysToClient(publicKey.getKid(), event);
                })
                .catch((reason: Error) => {
                    DefaultErrorHandler.handle(reason);
                });
        };
    }

    private saveKeysToClient(kid: string, event: MessageEvent): void {
        const filename = `${this.user.getKey().getId()}-${kid}.json`;
        this.downloadFile(this.createContentAsBlob(event, kid), filename);
        showSuccess(i18n('dialog.addUserKey.keyGenerated.success', filename));
    }

    private downloadFile(content: Blob, filename: string): void {
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = URL.createObjectURL(content);
        downloadAnchor.download = filename;
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    private createContentAsBlob(event: MessageEvent, kid: string): Blob {
        return new Blob([JSON.stringify({
            algorithm: 'RSA',
            kid: kid,
            label: this.labelTextInput.getValue(),
            principalKey: this.user.getKey().toString(),
            privateKey: event.data.privateKey,
        }, null, 2)], {
            type: 'application/json'
        });
    }

}

export class NewPublicKeyDialogButtonRow
    extends DropdownButtonRow {

    makeActionMenu(menuButtonConfig: Action | MenuButtonConfig, useDefault: boolean = true): MenuButton {
        super.makeActionMenu(menuButtonConfig, useDefault);
        return this.actionMenu.addClass(`${NewPublicKeyDialog.DIALOG_CSS_STYLE}-menu`) as MenuButton;
    }
}
