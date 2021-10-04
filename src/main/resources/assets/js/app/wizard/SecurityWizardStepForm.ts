import {IdProviderAccessControlComboBox, IdProviderAccessControlComboBoxBuilder} from './IdProviderAccessControlComboBox';
import {IdProvider} from '../principal/IdProvider';
import {IdProviderAccessControlList} from '../access/IdProviderAccessControlList';
import {Validators} from 'lib-admin-ui/ui/form/Validators';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {FormItem, FormItemBuilder} from 'lib-admin-ui/ui/form/FormItem';
import {i18n} from 'lib-admin-ui/util/Messages';
import {IdProviderAccessControlEntry} from '../access/IdProviderAccessControlEntry';
import {ArrayHelper} from 'lib-admin-ui/util/ArrayHelper';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';

export class SecurityWizardStepForm
    extends UserItemWizardStepForm {

    private inheritance: DivEl;

    private comboBox: IdProviderAccessControlComboBox;

    constructor() {
        super('security-wizard-step-form');
    }

    protected initElements(): void {
        super.initElements();

        this.inheritance = new DivEl(/*'inheritance'*/);
        this.comboBox = new IdProviderAccessControlComboBoxBuilder().build();
    }

    protected createFormItems(): FormItem[] {
        const accessComboBoxFormItem: FormItem = new FormItemBuilder(this.comboBox)
            .setValidator(Validators.required)
            .setLabel(i18n('field.permissions')).build();

        return [accessComboBoxFormItem];
    }

    layout(idProvider: IdProvider, defaultIdProvider: IdProvider): void {
        if (this.comboBox.isDirty()) {
            if (this.isNewPermissionsListEqualToCurrent(idProvider, defaultIdProvider)) {
                this.comboBox.resetBaseValues();
            }
        } else {
            this.doLayout(idProvider, defaultIdProvider);
        }
    }

    private isNewPermissionsListEqualToCurrent(idProvider: IdProvider, defaultIdProvider: IdProvider): boolean {
        const defaultEntries: IdProviderAccessControlEntry[] = defaultIdProvider?.getPermissions().getEntries() || [];
        const entries: IdProviderAccessControlEntry[] = idProvider.getPermissions().getEntries();

        const currentPermissions: IdProviderAccessControlEntry[]  = this.comboBox.getSelectedDisplayValues();
        const newPermissions: IdProviderAccessControlEntry[] = ArrayHelper.removeDuplicates([...defaultEntries, ...entries],
            (item: IdProviderAccessControlEntry) => item.toString());

        return newPermissions.length === currentPermissions.length &&
               ArrayHelper.difference(newPermissions, currentPermissions,
                   (a: IdProviderAccessControlEntry, b: IdProviderAccessControlEntry) => a.equals(b)).length === 0;
    }

    private doLayout(idProvider: IdProvider, defaultIdProvider: IdProvider) {
        const defaultEntries: IdProviderAccessControlEntry[] = defaultIdProvider?.getPermissions().getEntries() || [];
        const entries: IdProviderAccessControlEntry[] = idProvider.getPermissions().getEntries();

        this.comboBox.clearSelection(true);

        if (defaultIdProvider) {
            defaultEntries.forEach((item: IdProviderAccessControlEntry) => {
                this.comboBox.select(item, true, true);
                this.comboBox.resetBaseValues();
            });
        }

        entries.forEach((item: IdProviderAccessControlEntry) => {
            if (!this.comboBox.isSelected(item)) {
                this.comboBox.select(item, false, true);
                this.comboBox.resetBaseValues();
            }
        });
    }

    layoutReadOnly(idProvider: IdProvider): void {
        this.comboBox.clearSelection();
        idProvider.getPermissions().getEntries().forEach((item) => {
            if (!this.comboBox.isSelected(item)) {
                this.comboBox.select(item, true);
            }
        });

    }

    giveFocus(): boolean {
        return this.comboBox.giveFocus();
    }

    getPermissions(): IdProviderAccessControlList {
        return new IdProviderAccessControlList(this.comboBox.getSelectedDisplayValues());
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.comboBox.addClass('principal-combobox');

            this.prependChild(this.inheritance);

            return rendered;
        });
    }
}
