import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {DialogButton} from '@enonic/lib-admin-ui/ui/dialog/DialogButton';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {Fieldset} from '@enonic/lib-admin-ui/ui/form/Fieldset';
import {Form} from '@enonic/lib-admin-ui/ui/form/Form';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {TextInput} from '@enonic/lib-admin-ui/ui/text/TextInput';
import {CryptoWorker} from '../../util/CryptoWorker';
import {AddPublicKeyRequest} from '../../graphql/principal/user/AddPublicKeyRequest';
import {User} from '../principal/User';
import {ConfirmationOfGenerationKeysDialog} from './ConfirmationOfGenerationKeysDialog';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {PublicKey} from '../browse/serviceaccount/PublicKey';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';

export class AddPublicKeysDialog
    extends ModalDialog {

    private labelTextInput: TextInput;

    private principal: User;

    private generateKeysButton: DialogButton;

    private callback: (publicKey: PublicKey) => void;

    constructor(principal: User) {
        super({
            title: i18n('dialog.addUserKey.title')
        });

        this.principal = principal;

        this.getEl().addClass('add-public-keys-dialog');

        this.labelTextInput = new TextInput('middle');

        const labelFormItem: FormItem = new FormItemBuilder(this.labelTextInput).setLabel(i18n('field.addUserKeys.label')).build();

        const fieldSet = new Fieldset();
        fieldSet.add(labelFormItem);

        const form = new Form().add(fieldSet);

        this.initializeActions();
        this.appendChildToContentPanel(form);
        this.addCancelButtonToBottom();
    }

    private executeCallback(publicKey: PublicKey): void {
        if (this.callback) {
            this.callback(publicKey);
        }
    }

    private saveKeysToClient(user: User, event: MessageEvent): void {
        const filename = `${user.getKey().getId()}-${event.data.kid}.json`;
        this.downloadFile(this.createContentAsBlob(event, user), filename);
        new ConfirmationOfGenerationKeysDialog(filename).open();
    }

    private createContentAsBlob(event: MessageEvent, user: User): Blob {
        return new Blob([JSON.stringify({
            algorithm: 'RSA',
            kid: event.data.kid,
            label: this.labelTextInput.getValue(),
            principalKey: this.principal.getKey().toString(),
            email: user.getEmail(),
            privateKey: event.data.privateKey,
            publicKey: event.data.publicKey,
        }, null, 2)], {
            type: 'application/json'
        });
    }

    private downloadFile(content: Blob, filename: string): void {
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = URL.createObjectURL(content);
        downloadAnchor.download = filename;
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    private initializeActions(): void {
        this.generateKeysButton = this.addAction(new Action(i18n('dialog.addUserKey.generateBtn'), '').onExecuted(() => {
            CryptoWorker.getCryptoWorker().postMessage({
                label: this.labelTextInput.getValue(),
            });
            this.close();
        }));

        this.generateKeysButton.setEnabled(true);

        CryptoWorker.getCryptoWorker().onmessage = (event) => {
            new AddPublicKeyRequest()
                .setKey(this.principal.getKey())
                .setPublicKey(event.data.publicKey)
                .setKid(event.data.kid)
                .setLabel(this.labelTextInput.getValue())
                .sendAndParse()
                .then((publicKey) => {
                    this.saveKeysToClient(this.principal, event);
                    this.executeCallback(publicKey);
                })
                .catch((reason: Error) => {
                    DefaultErrorHandler.handle(reason);
                });
        };
    }

    setCallback(callback: (publicKey: PublicKey) => void): void {
        this.callback = callback;
    }

    open(): void {
        super.open();
    }

    show(): void {
        this.labelTextInput.reset();
        super.show();
    }

    close(): void {
        super.close();
        this.remove();
    }

}
