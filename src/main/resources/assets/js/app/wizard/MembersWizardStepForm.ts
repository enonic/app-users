import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {
    PrincipalComboBox,
    PrincipalComboBoxBuilder,
    PrincipalSelectedOptionsView
} from '@enonic/lib-admin-ui/ui/security/PrincipalComboBox';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Members} from '../principal/Members';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {PrincipalLoader} from '../principal/PrincipalLoader';
import {Option} from '@enonic/lib-admin-ui/ui/selector/Option';
import * as Q from 'q';
import {SelectedOption} from '@enonic/lib-admin-ui/ui/selector/combobox/SelectedOption';
import {RoleKeys} from '@enonic/lib-admin-ui/security/RoleKeys';

export class MembersWizardStepForm
    extends UserItemWizardStepForm {

    private principalCombobox: MembersPrincipalCombobox;

    constructor() {
        super('membership-wizard-step-form');
    }

    protected initElements(): void {
        super.initElements();

        const loader: PrincipalLoader = new PrincipalLoader()
            .setAllowedTypes([PrincipalType.GROUP, PrincipalType.USER])
            .skipPrincipals([PrincipalKey.ofAnonymous()])
            .setUseDataPreLoad(true) as PrincipalLoader;

        const builder: PrincipalComboBoxBuilder = PrincipalComboBox.create()
            .setLoader(loader)
            .setSelectedOptionsView(new MembersPrincipalSelectedOptionsView()) as PrincipalComboBoxBuilder;
        this.principalCombobox = new MembersPrincipalCombobox(builder);
    }

    protected createFormItems(): FormItem[] {
        const principalsFormItem: FormItem = new FormItemBuilder(this.principalCombobox).setLabel(i18n('field.members')).build();
        return [principalsFormItem];
    }

    layout(principal: Members): void {
        if (RoleKeys.isAdmin(principal.getKey())) {
            this.principalCombobox.setReadOnlyItems([PrincipalKey.ofSU()]);
        }

        if (this.principalCombobox.isDirty()) {
            if (ObjectHelper.arrayEquals(this.getMembersKeys(), principal.getMembers())) {
                this.principalCombobox.resetBaseValues();
            }
        } else {
            this.getLoader().skipPrincipal(principal.getKey());
            const value: string = principal.getMembers().map((key: PrincipalKey) => key.toString()).join(';');
            this.principalCombobox.setValue(value);
        }
    }

    getMembers(): Principal[] {
        return this.principalCombobox.getSelectedDisplayValues();
    }

    getMembersKeys(): PrincipalKey[] {
        return this.getMembers().map((principal: Principal) => principal.getKey());
    }

    giveFocus(): boolean {
        return this.principalCombobox.giveFocus();
    }

    getLoader(): PrincipalLoader {
        return this.principalCombobox.getLoader() as PrincipalLoader;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.form);

            return rendered;
        });
    }
}

class MembersPrincipalCombobox
    extends PrincipalComboBox {

    private readOnlyItems: PrincipalKey[] = [];

    protected createOption(p: Principal, readOnly?: boolean): Option<Principal> {
        return super.createOption(p, readOnly || this.isReadOnlyItem(p.getKey()));
    }

    setReadOnlyItems(items: PrincipalKey[]): void {
        this.readOnlyItems = items || [];

        (this.getSelectedOptionView() as MembersPrincipalSelectedOptionsView).setReadOnlyItems(items);
    }

    private isReadOnlyItem(key: PrincipalKey): boolean {
        return this.readOnlyItems.some((item: PrincipalKey) => item.equals(key));
    }
}

class MembersPrincipalSelectedOptionsView
    extends PrincipalSelectedOptionsView {

    private readOnlyItems: PrincipalKey[] = [];

    createSelectedOption(option: Option<Principal>): SelectedOption<Principal> {
        const selectedOption = super.createSelectedOption(option);

        if (this.isReadOnlyItem(option)) {
            selectedOption.getOptionView().setReadonly(true);
        }

        return selectedOption;
    }

    setReadOnlyItems(items: PrincipalKey[]): void {
        this.readOnlyItems = items || [];
    }

    private isReadOnlyItem(option: Option<Principal>): boolean {
        const key: PrincipalKey = option.getDisplayValue().getKey();
        return this.readOnlyItems.some((item: PrincipalKey) => item.equals(key));
    }
}
