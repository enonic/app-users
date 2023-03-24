import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {TextInput} from '@enonic/lib-admin-ui/ui/text/TextInput';
import {TextArea} from '@enonic/lib-admin-ui/ui/text/TextArea';
import {FormItem} from '@enonic/lib-admin-ui/ui/form/FormItem';

export class ServiceAccountWizardStepForm
    extends UserItemWizardStepForm {

    private kid: TextInput;

    private publicKey: TextArea;

    constructor() {
        super();
    }

    protected initElements(): void {
        super.initElements();

        this.kid = new TextInput();

        this.publicKey = new TextArea("name");
    }

    protected createFormItems(): FormItem[] {
        return [];
    }
}
