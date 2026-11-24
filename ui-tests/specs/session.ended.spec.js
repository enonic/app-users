const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const LoginPage = require('../page_objects/login.page');
const MenuSectionsRail = require('../page_objects/menu.sections.rail');
const NotificationToast = require('../page_objects/notification.toast');

describe("session.ended.spec - a session ended elsewhere reaches the Settings app left open in another tab: a notification that stays, with 'Reload' as the way back to the login page", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const SESSION_ENDED = appConst.CONNECTION.SESSION_ENDED;
  const RELOAD = appConst.CONNECTION.RELOAD;
  // The tab the Settings app is open in, and the one the visitor logs out from.
  let SETTINGS_TAB, OTHER_TAB;

  it("GIVEN the Settings app is opened in one browser tab WHEN the user has logged out in another tab THEN 'Your session has ended' notification should be shown in the first tab with 'Reload' button", async () => {
    let notificationToast = new NotificationToast();
    let menuSectionsRail = new MenuSectionsRail();
    // 1. Open the Settings app on a section.
    await settingsUtils.navigateToSettingsApp('su', 'password', appConst.EXTENSIONS.ROLES);
    SETTINGS_TAB = await settingsUtils.getBrowser().getWindowHandle();
    assert.ok(
      !(await notificationToast.isMessageDisplayed(SESSION_ENDED)),
      'The notification should not be shown while the session stands',
    );
    // 2. Open the XP home page in a second tab and log out there.
    await settingsUtils.getBrowser().newWindow(settingsUtils.getBaseUrl());
    OTHER_TAB = await settingsUtils.getBrowser().getWindowHandle();
    assert.notEqual(OTHER_TAB, SETTINGS_TAB);
    await settingsUtils.doLogout();
    // 3. Go back to the first tab: nothing was clicked or reloaded in it.
    await settingsUtils.getBrowser().switchToWindow(SETTINGS_TAB);
    // 4. Verify the notification and its 'Reload' button.
    await notificationToast.waitForMessage(SESSION_ENDED);
    await settingsUtils.saveScreenshot('session_ended_notification');
    assert.ok(
      await notificationToast.isActionButtonDisplayed(SESSION_ENDED, RELOAD),
      "'Reload' button should be displayed in the notification",
    );
    // 5. It is the only notification - the connection lost with the session is not reported as well.
    assert.deepEqual(await notificationToast.getMessages(), [SESSION_ENDED]);
    // 6. The page itself is left as it was: the rail and the section opened are still there.
    assert.equal(await menuSectionsRail.getActiveSectionName(), appConst.EXTENSIONS.ROLES);
  });

  // The notification is for good: it does not hide by itself as an ordinary message does.
  it("GIVEN 'Your session has ended' notification is shown WHEN a few seconds have passed THEN the notification should remain displayed", async () => {
    let notificationToast = new NotificationToast();
    await settingsUtils.getBrowser().pause(appConst.TIMEOUT.LONG);
    assert.ok(
      await notificationToast.isMessageDisplayed(SESSION_ENDED),
      'The notification should not hide by itself',
    );
    assert.deepEqual(await notificationToast.getMessages(), [SESSION_ENDED]);
  });

  it("GIVEN 'Your session has ended' notification is shown WHEN 'Reload' button has been clicked THEN the login page should be loaded", async () => {
    let notificationToast = new NotificationToast();
    let loginPage = new LoginPage();
    // 1. Click on 'Reload' in the notification.
    await notificationToast.clickOnActionButton(SESSION_ENDED, RELOAD);
    // 2. Verify that the page was reloaded into the login page.
    await loginPage.waitForPageLoaded();
    await settingsUtils.saveScreenshot('session_ended_reloaded');
  });

  // The second tab is closed, so the specs that follow in the same session start from one window.
  after(async () => {
    if (OTHER_TAB === undefined) {
      return;
    }
    await settingsUtils.getBrowser().switchToWindow(OTHER_TAB);
    await settingsUtils.getBrowser().closeWindow();
    await settingsUtils.getBrowser().switchToWindow(SETTINGS_TAB);
  });
});
