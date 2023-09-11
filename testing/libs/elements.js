/**
 * Created  on 07.09.2017.
 */

module.exports = Object.freeze({
    generateRandomName: part => part + Math.round(Math.random() * 1000000),
    NAMES_VIEW_BY_NAME: "//div[contains(@id,'NamesView') and child::p[contains(@class,'sub-name') and contains(.,'%s')]]",
    NAMES_VIEW_BY_DISPLAY_NAME: "//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name') and contains(.,'%s')]]",
    SLICK_ROW: "//div[contains(@class,'slick-viewport')]//div[contains(@class,'slick-row')]",
    SLICK_ROW_BY_NAME: "//div[contains(@class,'slick-viewport')]//div[contains(@class,'slick-row') and descendant::p[contains(@class,'sub-name') and contains(.,'%s')]]",
    H6_DISPLAY_NAME: "//div[contains(@id,'NamesView')]//h6[contains(@class,'main-name')]",
    TEXT_INPUT: "//input[@type='text']",
    DROP_DOWN_HANDLE: "//button[contains(@id,'DropdownHandle')]",
    slickRowByDisplayName(displayName) {
        return `//div[contains(@class,'slick-viewport')]//div[contains(@class,'slick-row') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`
    },
    itemByDisplayName(displayName) {
        return `//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`
    },
    itemByName(name) {
        return ` //div[contains(@id,'NamesView') and child::p[contains(@class,'sub-name') and contains(.,'${name}')]]`
    },
    tabItemByDisplayName(displayName) {
        return `//li[contains(@id,'AppBarTabMenuItem') and descendant::a[contains(.,'${displayName}')]]`
    },
    formItemByLabel: (label) => {
        return `//div[contains(@id,'FormItem') and child::label[contains(.,'${label}')]]`
    },
    CANCEL_BUTTON_TOP: `//div[@class='cancel-button-top']`,

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
        BUTTON_WITH_SPAN_ADD: "//button[child::span[text()='Add']]",
        DROP_DOWN_HANDLE: "//button[contains(@id,'DropdownHandle')]",
        actionButton: (label) => `//button[contains(@id,'ActionButton') and child::span[contains(.,'${label}')]]`,
        dialogButton: label => `//button[contains(@id,'DialogButton') and child::span[contains(.,'${label}')]]`,
        dialogButtonStrict: label => `//button[contains(@id,'DialogButton') and child::span[text()='${label}']]`,
        togglerButton: (label) => `//button[contains(@id,'TogglerButton') and child::span[text()='${label}']]`,
    },
});
