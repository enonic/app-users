const Page = require('./page');
const appConst = require('../libs/app_const');

// The shell's toasts (NotificationList → @enonic/ui Toast), light DOM: a section's own messages
// and the shell's - a lost connection, an ended session with its 'Reload' action.
const TOAST = "//*[@data-component='Toast']";
const XPATH = {
  toastByText: (text) =>
    `${TOAST}[descendant::*[@data-component='Toast.Description' and contains(.,"${text}")]]`,
  actionButton: (text, label) =>
    `${XPATH.toastByText(text)}//button[normalize-space(.)='${label}']`,
};

class NotificationToast extends Page {
  // Waits for the toast with the given text. The session-ended one comes over the events socket,
  // so it is given longer than a message that answers a click.
  async waitForMessage(text, ms = appConst.TIMEOUT.LONG) {
    try {
      await this.waitForElementDisplayed(XPATH.toastByText(text), ms);
    } catch (err) {
      await this.handleError(`The notification '${text}' was not shown`, 'err_toast', err);
    }
  }

  async isMessageDisplayed(text) {
    const toasts = await this.findElements(XPATH.toastByText(text));
    return toasts.length > 0 && (await toasts[0].isDisplayed());
  }

  // Texts of every toast currently shown.
  getMessages() {
    return this.getNotificationMessages();
  }

  async isActionButtonDisplayed(text, label) {
    const buttons = await this.findElements(XPATH.actionButton(text, label));
    return buttons.length > 0 && (await buttons[0].isDisplayed());
  }

  // Clicks the action of the toast with the given text, e.g. 'Reload'.
  async clickOnActionButton(text, label) {
    try {
      await this.waitForElementDisplayed(XPATH.actionButton(text, label));
      await this.clickOnElement(XPATH.actionButton(text, label));
    } catch (err) {
      await this.handleError(
        `The '${label}' button of the notification '${text}'`,
        'err_toast_action',
        err,
      );
    }
  }
}

module.exports = NotificationToast;
