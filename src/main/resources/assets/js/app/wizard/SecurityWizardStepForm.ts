import {
    IdProviderAccessControlComboBox,
    IdProviderAccessControlComboBoxWrapper
} from './IdProviderAccessControlComboBox';
import {IdProvider} from '../principal/IdProvider';
import {IdProviderAccessControlList} from '../access/IdProviderAccessControlList';
import {Validators} from '@enonic/lib-admin-ui/ui/form/Validators';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {IdProviderAccessControlEntry} from '../access/IdProviderAccessControlEntry';
import {ArrayHelper} from '@enonic/lib-admin-ui/util/ArrayHelper';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {IdProviderWizardPanelParams} from './IdProviderWizardPanelParams';

export class SecurityWizardStepForm
    extends UserItemWizardStepForm<IdProvider> {

    private inheritance: DivEl;

    private comboBox: IdProviderAccessControlComboBox;

    private comboboxWrapper: IdProviderAccessControlComboBoxWrapper;

    constructor(params: IdProviderWizardPanelParams) {
        super(params, 'security-wizard-step-form');
    }

    protected initElements(): void {
        super.initElements();

        this.inheritance = new DivEl(/*'inheritance'*/);
        this.comboBox = new IdProviderAccessControlComboBox();
        this.comboboxWrapper = new IdProviderAccessControlComboBoxWrapper(this.comboBox);
    }

    protected createFormItems(): FormItem[] {
        const accessComboBoxFormItem: FormItem = new FormItemBuilder(this.comboboxWrapper)
            .setValidator(Validators.required)
            .setLabel(i18n('field.permissions')).build();

        return [accessComboBoxFormItem];
    }

    layout(idProvider: IdProvider, defaultIdProvider: IdProvider): void {
        if (this.comboboxWrapper.isDirty()) {
            if (this.isNewPermissionsListEqualToCurrent(idProvider, defaultIdProvider)) {
                this.comboboxWrapper.resetBaseValues();
            }
        } else {
            this.doLayout(idProvider, defaultIdProvider);
        }
    }

    private isNewPermissionsListEqualToCurrent(idProvider: IdProvider, defaultIdProvider: IdProvider): boolean {
        const defaultEntries: IdProviderAccessControlEntry[] = defaultIdProvider?.getPermissions().getEntries() || [];
        const entries: IdProviderAccessControlEntry[] = idProvider.getPermissions().getEntries();

        const currentPermissions: IdProviderAccessControlEntry[] = this.comboBox.getSelectedOptions().map(
            (option) => option.getOption().getDisplayValue());
        const newPermissions: IdProviderAccessControlEntry[] = ArrayHelper.removeDuplicates([...defaultEntries, ...entries],
            (item: IdProviderAccessControlEntry) => item.toString());

        return newPermissions.length === currentPermissions.length &&
               ArrayHelper.difference(newPermissions, currentPermissions,
                   (a: IdProviderAccessControlEntry, b: IdProviderAccessControlEntry) => a.equals(b)).length === 0;
    }

    private doLayout(idProvider: IdProvider, defaultIdProvider: IdProvider) {
        const defaultEntries: IdProviderAccessControlEntry[] = defaultIdProvider?.getPermissions().getEntries() || [];
        const entries: IdProviderAccessControlEntry[] = idProvider.getPermissions().getEntries();

        this.comboBox.deselectAll();

        if (defaultIdProvider) {
            defaultEntries.forEach((item: IdProviderAccessControlEntry) => {
                this.comboBox.select(item);
            });
        }

        entries.forEach((item: IdProviderAccessControlEntry) => {
            if (!this.comboBox.isSelected(item.getPrincipal().getKey().toString())) {
                this.comboBox.select(item);
            }
        });
    }

    layoutReadOnly(idProvider: IdProvider): void {
        this.comboBox.deselectAll();

        idProvider.getPermissions().getEntries().forEach((item) => {
            if (!this.comboBox.isSelected(item.getPrincipal().getKey().toString())) {
                this.comboBox.select(item, true);
            }
        });

    }

    giveFocus(): boolean {
        return this.comboBox.giveFocus();
    }

    getPermissions(): IdProviderAccessControlList {
        return new IdProviderAccessControlList(this.comboBox.getSelectedOptions().map(
            (option) => option.getOption().getDisplayValue()));
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.comboBox.addClass('principal-combobox');

            this.prependChild(this.inheritance);

            return rendered;
        });
    }
}
