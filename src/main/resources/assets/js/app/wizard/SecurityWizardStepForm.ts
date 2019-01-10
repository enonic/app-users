import {IdProviderAccessControlComboBox} from './IdProviderAccessControlComboBox';
import {IdProvider} from '../principal/IdProvider';
import {IdProviderAccessControlList} from '../access/IdProviderAccessControlList';
import FormItemBuilder = api.ui.form.FormItemBuilder;
import Validators = api.ui.form.Validators;
import DivEl = api.dom.DivEl;
import i18n = api.util.i18n;

export class SecurityWizardStepForm extends api.app.wizard.WizardStepForm {

    private inheritance: DivEl;
    private comboBox: IdProviderAccessControlComboBox;
    private userStore: IdProvider;

    constructor() {
        super('security-wizard-step-form');

        this.inheritance = new DivEl(/*'inheritance'*/);

        this.comboBox = new IdProviderAccessControlComboBox();
        this.comboBox.addClass('principal-combobox');

        let accessComboBoxFormItem = new FormItemBuilder(this.comboBox)
            .setValidator(Validators.required)
            .setLabel(i18n('field.permissions')).build();

        let fieldSet = new api.ui.form.Fieldset();
        fieldSet.add(accessComboBoxFormItem);

        let form = new api.ui.form.Form().add(fieldSet);

        form.onFocus((event) => {
            this.notifyFocused(event);
        });
        form.onBlur((event) => {
            this.notifyBlurred(event);
        });

        this.appendChild(this.inheritance);
        this.appendChild(form);

    }

    layout(userStore: IdProvider, defaultUserStore: IdProvider) {
        this.userStore = userStore;

        this.comboBox.clearSelection();

        if (defaultUserStore) {
            defaultUserStore.getPermissions().getEntries().forEach((item) => {
                this.comboBox.select(item, true);
            });
        }

        userStore.getPermissions().getEntries().forEach((item) => {
            if (!this.comboBox.isSelected(item)) {
                this.comboBox.select(item);
            }
        });

    }

    layoutReadOnly(userStore: IdProvider) {
        this.userStore = userStore;

        this.comboBox.clearSelection();
        userStore.getPermissions().getEntries().forEach((item) => {
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

}
