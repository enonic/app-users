import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {
    PrincipalComboBox, PrincipalComboBoxParams,
    PrincipalComboBoxWrapper,
    PrincipalSelectedOptionsView
} from '@enonic/lib-admin-ui/ui/security/PrincipalComboBox';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Members} from '../principal/Members';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {UserItemWizardStepForm} from './UserItemWizardStepForm';
import {PrincipalLoader} from '../principal/PrincipalLoader';
import {Option} from '@enonic/lib-admin-ui/ui/selector/Option';
import Q from 'q';
import {SelectedOption} from '@enonic/lib-admin-ui/ui/selector/combobox/SelectedOption';
import {RoleKeys} from '@enonic/lib-admin-ui/security/RoleKeys';
import {UrlHelper} from '../../util/UrlHelper';

export class MembersWizardStepForm
    extends UserItemWizardStepForm {

    private membersCombobox: MembersPrincipalCombobox;

    private comboboxWrapper: PrincipalComboBoxWrapper;

    constructor() {
        super('membership-wizard-step-form');
    }

    protected initElements(): void {
        super.initElements();

        this.membersCombobox = new MembersPrincipalCombobox({
            maxSelected: 0,
            allowedTypes: [PrincipalType.GROUP, PrincipalType.USER],
            skipPrincipals: [PrincipalKey.ofAnonymous()],
            selectedOptionsView: new MembersPrincipalSelectedOptionsView(),
        });

        this.comboboxWrapper = new PrincipalComboBoxWrapper(this.membersCombobox);
    }

    protected createFormItems(): FormItem[] {
        const principalsFormItem: FormItem = new FormItemBuilder(this.comboboxWrapper).setLabel(i18n('field.members')).build();
        return [principalsFormItem];
    }

    layout(principal: Members): void {
        if (RoleKeys.isAdmin(principal.getKey())) {
            this.membersCombobox.setReadOnlyItems([PrincipalKey.ofSU()]);
        }

        if (this.comboboxWrapper.isDirty()) {
            if (ObjectHelper.arrayEquals(this.getMembersKeys(), principal.getMembers())) {
                this.comboboxWrapper.resetBaseValues();
            }
        } else {
            this.getLoader().skipPrincipal(principal.getKey());
            this.membersCombobox.setSelectedItems(principal.getMembers());
        }
    }

    getMembers(): Principal[] {
        return this.membersCombobox.getSelectedOptions().map((option) => option.getOption().getDisplayValue());
    }

    getMembersKeys(): PrincipalKey[] {
        return this.getMembers().map((principal: Principal) => principal.getKey());
    }

    giveFocus(): boolean {
        return this.membersCombobox.giveFocus();
    }

    getLoader(): PrincipalLoader {
        return this.membersCombobox.getLoader() as PrincipalLoader;
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

    constructor(options?: PrincipalComboBoxParams) {
        options.postfixUri = options.postfixUri ?? UrlHelper.getRestUri(''); // override the default postfixUri
        super(options);
    }

    private readOnlyItems: PrincipalKey[] = [];

    setReadOnlyItems(items: PrincipalKey[]): void {
        this.readOnlyItems = items || [];

        (this.selectedOptionsView as MembersPrincipalSelectedOptionsView).setReadOnlyItems(items);
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
