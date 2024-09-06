/**
 * Created  on 07.09.2017.
 */

module.exports = Object.freeze({
    generateRandomName: part => part + Math.round(Math.random() * 1000000),
    H6_DISPLAY_NAME: "//div[contains(@id,'NamesView')]//h6[contains(@class,'main-name')]",
    TEXT_INPUT: "//input[@type='text']",
    LI_MENU_ITEM: "//li[contains(@id,'MenuItem')]",

    itemByDisplayName(displayName) {
        return `//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`
    },
    itemByName(name) {
        return ` //div[contains(@id,'NamesView') and child::p[contains(@class,'sub-name') and contains(.,'${name}')]]`
    },
    menuItemByName(name) {
        return `//li[contains(@id,'MenuItem') and contains(.,'${name}')]`
    },
    tabItemByDisplayName(displayName) {
        return `//li[contains(@id,'AppBarTabMenuItem') and descendant::a[contains(.,'${displayName}')]]`
    },
    formItemByLabel: (label) => {
        return `//div[contains(@id,'FormItem') and child::label[contains(.,'${label}')]]`
    },

    COMBO_BOX_OPTION_FILTER_INPUT: "//input[contains(@id,'ComboBoxOptionFilterInput')]",

    PRINCIPAL_SELECTED_OPTION: `//div[contains(@id,'PrincipalSelectedOptionView')]`,

    selectedPrincipalByDisplayName(displayName) {
        return `//div[contains(@id,'PrincipalSelectedOptionView') and descendant::h6[contains(@class,'main-name') and text()='${displayName}']]`
    },
    REMOVE_ICON: `//a[@class='remove']`,
    EDIT_ICON: `//a[@class='edit']`,
    CHECKBOX: `//div[contains(@id,'Checkbox')]`,
    NOTIFICATION_TEXT: "//div[@class='notification-text']",
    BUTTONS: {
        CANCEL_BUTTON_TOP: `//div[@class='cancel-button-top']`,
        BUTTON_WITH_SPAN_ADD: "//button[child::span[text()='Add']]",
        DROP_DOWN_HANDLE: "//button[contains(@id,'DropdownHandle')]",
        actionButton: (label) => `//button[contains(@id,'ActionButton') and child::span[contains(.,'${label}')]]`,
        dialogButton: label => `//button[contains(@id,'DialogButton') and child::span[contains(.,'${label}')]]`,
        dialogButtonStrict: label => `//button[contains(@id,'DialogButton') and child::span[text()='${label}']]`,
        togglerButton: (label) => `//button[contains(@id,'TogglerButton') and child::span[text()='${label}']]`,
    },
    DROPDOWN_SELECTOR: {
        // clickable option in dropdown options list
        dropdownListItemByDisplayName: (container, displayName) => {
            return container +
                   `//li[contains(@class,'item-view-wrapper')]//h6[contains(@class,'main-name') and contains(.,'${displayName}')]`;
        },
        dropdownListItemByName: (container, name) => {
            return container +
                   `//li[contains(@class,'item-view-wrapper')]//p[contains(@class,'sub-name') and contains(.,'${name}')]`;
        },

        DROPDOWN_HANDLE: "//button[contains(@id,'DropdownHandle')]",
        OPTION_FILTER_INPUT: "//input[contains(@id,'OptionFilterInput') and contains(@class, 'option-filter-input')]",
        MODE_TOGGLER_BUTTON: "//button[contains(@id,'ModeTogglerButton')]",
        APPLY_SELECTION_BUTTON: "//button[contains(@class,'apply-selection-button')]",
        CONTENT_TREE_SELECTOR: "//div[contains(@id,'ContentTreeSelectorDropdown')]",
        CONTENTS_TREE_LIST_UL: "//ul[contains(@id,'ContentsTreeList')]",
        DROPDOWN_LIST_ITEM: "//li[contains(@class,'item-view-wrapper')]",
        WIDGET_FILTER_DROPDOWN: `//div[contains(@id,'WidgetFilterDropdown')]`,
        FILTERABLE_LISTBOX: "//div[contains(@id,'FilterableListBoxWrapper')]",
    },
    TREE_GRID: {
        EXPANDER_ICON_DIV: "//div[contains(@class,'toggle icon-arrow_drop_up')]",
        itemByName: name => {
            return `//div[contains(@id,'NamesView') and child::p[contains(@class,'xp-admin-common-sub-name') and contains(.,'${name}')]]`
        },
        listItemByDisplayName: (displayName) => {
            return `//li[contains(@class,'item-view-wrapper') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`;
        },
        itemTreeGridListElementByDisplayName: displayName => {//ContentTreeGridListViewer
            return `(//li[contains(@id,'UserItemsTreeListElement') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]])[last()]`
        },
        itemTreeGridListElementByName: name => {
            return `//li[contains(@id,'UserItemsTreeListElement') and descendant::p[contains(@class,'sub-name') and contains(.,'${name}')]]`
        },
        itemTypesTreeGridListElement: displayName => {
            return `//li[contains(@id,'UserItemTypesTreeGridListElement') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`
        }
    },
    DIV: {
        CHECKBOX_DIV: "//div[contains(@id,'Checkbox')]",
        DROPDOWN_DIV: "//div[contains(@id,'Dropdown')]",
    },
});
