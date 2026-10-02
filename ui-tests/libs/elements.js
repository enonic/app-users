const COMMON = {
  SHADOW_SELECTORS: {
    XP_MENU_BUTTON: `button#menu-button`,
    CONTEXT_MENU_ITEM: `[data-component="ContextMenu.Item"]`,
  },
  DISPLAY_NAME_INPUT: "//input[@name='displayName']",
  FOOTER_ELEMENT: `//footer`,
  // The host's toasts (app-settings NotificationList → @enonic/ui Toast), light DOM.
  NOTIFICATION_TEXT: "//*[@data-component='Toast']//*[@data-component='Toast.Description']",
  NOTIFICATION_CLOSE_BUTTON: "//*[@data-component='Toast']//*[@data-component='Toast.Close']",
  TEXT_INPUT: "//input[@type='text']",
  SELECT_ALL_CHECKBOX_LABEL:
    "//label[descendant::input[@type='checkbox' and @aria-label='Select all']]",
  CLEAR_SELECTION_CHECKBOX_LABEL:
    "//label[descendant::input[@type='checkbox' and contains(@aria-label,'Clear selection')]]",

  INPUTS: {
    CHECKBOX_INPUT: "//input[@type='checkbox']",
    DATA_COMPONENT_INPUT: "//div[@data-component='Input']",
    VALIDATION_RECORDING: "//div[contains(@class,'text-error')]",
    CHECKBOX_INPUT_CHECKED: "//input[@type='checkbox' and @aria-checked='true']",
    TEXT: "//input[@type='text']",
    TEXTAREA: '//textarea',
    INPUT: '//input',
    DIV_BUTTON: "//div[@role='button']",
  },
};
const BUTTONS = {
  BUTTON_REMOVE_ICON: "//button[@aria-label='Remove']",
  BUTTON_EDIT_ICON: "//button[@aria-label='Edit']",
  buttonByLabel: (label) => `//button[@type='button' and contains(.,'${label}')]`,
  radioButtonByLabel: (label) => `//button[@role='radio' and contains(.,'${label}')]`,
  BUTTON_MENU_POPUP: "//button[@aria-haspopup='menu']",
  buttonAriaLabel: (ariaLabel) =>
    `//button[@type='button' and contains(@aria-label,'${ariaLabel}') and not(ancestor::*[@aria-hidden='true']) and not(ancestor::*[contains(@class,'sm:hidden')])]`,
  BUTTON: (label) => `//button[contains(@type,'button') and contains(.,'${label}')]`,
  ICON_BUTTON: "//button[@data-component='IconButton']",
};
const TREE_GRID = {
  DIV_ROLE_GRID: "//div[@role='grid']",
  DIV_ROLE_ROW: "//div[@role='row']",
  VIRTUALIZED_TREE_ROW: "//div[@data-component='VirtualizedTreeList.Row']",
  TREE_LIST_DIV: "//div[contains(@id,'tree-list')]",
  TREE_LIST_ITEM_COMPONENT: "//div[@data-component='ListItem']",
  TREE_ITEM_DIV: "//div[contains(@role,'treeitem') and descendant::small]",
  TREE_LIST_ITEM_CHECKBOX_LABEL: "//div[@role='checkbox']",
  TREE_LIST_ITEM_CHECKBOX_CHECKED: "//div[@role='checkbox' and @aria-checked='true']",
  SORT_DIALOG_TOGGLE: "//div[contains(@class,'sort-dialog-trigger')]",
  EXPANDER_ICON_DIV: "//div[contains(@class,'toggle icon-arrow_drop_up')]",
  GRID_LIST_ROW: `//div[@data-component='GridList']//div[@data-component='GridList.Row']`,
};

module.exports = Object.freeze({
  COMMON,
  BUTTONS,
  TREE_GRID,
});
