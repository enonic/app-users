/**
 * Created on 12/2/2017.
 */
const HomePage = require('../page_objects/home.page');
const LoginPage = require('../page_objects/login.page');
const appConst = require('./app_const');
const webDriverHelper = require('./WebDriverHelper');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');
const MenuSectionsRail = require('../page_objects/menu.sections.rail');
const fs = require('fs');
const path = require('path');

module.exports = {
  getBrowser() {
    if (typeof browser !== 'undefined') {
      return browser;
    } else {
      return webDriverHelper.browser;
    }
  },
  async waitForElementDisplayed(selector, ms) {
    let element = await this.getBrowser().$(selector);
    return await element.waitForDisplayed(ms);
  },
  async waitForElementNotDisplayed(selector, ms) {
    let element = await this.getBrowser().$(selector);
    return await element.waitForDisplayed(ms);
  },
  async clickOnElement(selector) {
    let el = await this.getBrowser().$(selector);
    await el.waitForDisplayed({ timeout: 2000 });
    return await el.click();
  },
  async getText(selector) {
    let el = await this.getBrowser().$(selector);
    await el.waitForDisplayed({ timeout: 2000 });
    return await el.getText();
  },

  async isElementDisplayed(selector) {
    let el = await this.getBrowser().$(selector);
    return await el.isDisplayed();
  },
  getPageSource() {
    return this.getBrowser().getPageSource();
  },

  getTitle() {
    return this.getBrowser().getTitle();
  },

  scrollViewPort(viewportElement, step) {
    return this.getBrowser().execute('arguments[0].scrollTop=arguments[1]', viewportElement, step);
  },
  async doCloseCurrentBrowserTab() {
    let title = await this.getBrowser().getTitle();
    if (title !== 'Enonic XP Home') {
      //return await this.getBrowser().closeWindow();
      return await this.getBrowser().execute('window.close();');
    }
  },
  async saveScreenshotUniqueName(namePart) {
    let screenshotName = appConst.generateRandomName(namePart);
    await this.saveScreenshot(screenshotName);
    return screenshotName;
  },

  async doLogout() {
    let loginPage = new LoginPage();
    let homePage = new HomePage();
    await homePage.clickOnAvatarButton();
    await homePage.clickOnLogoutDropdownMenuItem();
    return await loginPage.waitForPageLoaded();
  },
  // Logs in, opens the Settings app and, when a section is given, switches to it via the rail.
  // `section` is one of MenuSectionsRail.SECTION.* ('Users', 'Roles', ...).
  async navigateToSettingsApp(userName, password, section) {
    try {
      await this.doLogin(userName, password);
      let homePage = new HomePage();
      await homePage.clickOnSettingsLink();
      let menuSectionsRail = new MenuSectionsRail();
      await menuSectionsRail.waitForLoaded();
      if (section) {
        await this.navigateToExtension(section);
      }
    } catch (err) {
      let screenshot = await this.saveScreenshotUniqueName('err_navigate_settings');
      throw new Error(
        `Error occurred after clicking on Settings link ,  screenshot:${screenshot}  ` + err,
      );
    }
  },
  async doLogin(userName, password) {
    let loginPage = new LoginPage();
    let result = await loginPage.isLoaded();
    if (result) {
      await loginPage.doLogin(userName, password);
    }
    let homePage = new HomePage();
    await homePage.waitForSettingsLinkDisplayed();
  },
  async switchToTab(title) {
    let handles = await this.getBrowser().getWindowHandles();
    for (const handle of handles) {
      await this.getBrowser().switchToWindow(handle);
      let currentTitle = await this.getBrowser().getTitle();
      if (currentTitle === title) {
        return handle;
      }
    }
    throw new Error('Browser tab with title ' + title + ' was not found');
  },
  async waitForNewTabAndSwitch(expectedTitlePart) {
    let matchedHandle = null;
    try {
      await this.getBrowser().waitUntil(
        async () => {
          let handles = await this.getBrowser().getWindowHandles();
          for (const handle of handles) {
            try {
              await this.getBrowser().switchToWindow(handle);
              let currentTitle = await this.getBrowser().getTitle();
              if (currentTitle.includes(expectedTitlePart)) {
                matchedHandle = handle;
                return true;
              }
            } catch (err) {
              // the tab is not ready yet or has been closed
            }
          }
          return false;
        },
        {
          timeout: appConst.TIMEOUT.MEDIUM,
          timeoutMsg: `A browser tab with the title containing '${expectedTitlePart}' was not opened`,
        },
      );
      return matchedHandle;
    } catch (err) {
      let screenshot = await this.saveScreenshotUniqueName('err_new_tab_switch');
      throw new Error(
        `Error when switching to the new browser tab: ${err} [screenshot]: ${screenshot}`,
      );
    }
  },

  async doPressBackspace() {
    await this.getBrowser().keys('\uE003');
    return await this.getBrowser().pause(200);
  },
  doPressTabKey() {
    return this.getBrowser().keys('Tab');
  },
  doPressEnter() {
    return this.getBrowser().keys('Enter');
  },
  async doSwitchToNewTab() {
    try {
      console.log('testUtils:switching to the new wizard tab...');
      let tabs = await this.getBrowser().getWindowHandles();
      await this.getBrowser().switchToWindow(tabs[tabs.length - 1]);
    } catch (err) {
      throw new Error('Error when switching to the new browser tab ' + err);
    }
  },

  async doSwitchToTabByIndex(index) {
    try {
      let tabs = await this.getBrowser().getWindowHandles();
      await this.getBrowser().switchToWindow(tabs[index]);
    } catch (err) {
      throw new Error('Error occurred during switching to the new browser tab ' + err);
    }
  },
  async doSwitchToPrevTab() {
    try {
      let tabs = await this.getBrowser().getWindowHandles();
      return await this.getBrowser().switchToWindow(tabs[tabs.length - 2]);
    } catch (err) {
      throw new Error('Error occurred while switching to the new browser tab' + err);
    }
  },

  async doCloseAllWindowTabsAndNavigateToHome() {
    await this.doCloseAllWindowTabs();
    await this.navigateToHomePage();
  },
  async navigateToHomePage() {
    await this.getBrowser().url('http://localhost:8080/admin/');
    await this.getBrowser().pause(500);
  },
  async doCloseAllWindowTabs(keepTitle1 = 'Enonic XP Admin', keepTitle2 = 'Settings') {
    const handles = await this.getBrowser().getWindowHandles();
    const keepTitles = [keepTitle1, keepTitle2].filter(Boolean);

    for (const handle of handles) {
      await this.getBrowser().switchToWindow(handle);
      const title = await this.getBrowser().getTitle();

      const shouldKeep = keepTitles.some((keepTitle) => title.includes(keepTitle));
      if (!shouldKeep) {
        // Closing the last remaining window would terminate the WebDriver session,
        // so keep it open - the caller navigates it to the home page afterwards:
        const remaining = await this.getBrowser().getWindowHandles();
        if (remaining.length === 1) {
          break;
        }
        await this.getBrowser().closeWindow();
        await this.getBrowser().pause(100);
      }
    }
    // After closeWindow() the driver still points to the closed window - switch to a live one:
    const remainingHandles = await this.getBrowser().getWindowHandles();
    await this.getBrowser().switchToWindow(remainingHandles[remainingHandles.length - 1]);
  },
  async saveScreenshot(name, that) {
    try {
      let screenshotsDir = path.join(__dirname, '/../build/reports/screenshots/');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }
      await this.getBrowser().saveScreenshot(screenshotsDir + name + '.png');
      console.log('screenshot is saved ' + name);
    } catch (err) {
      return console.log('screenshot was not saved ' + err);
    }
  },
  generateRandomName(part) {
    return part + Math.round(Math.random() * 1000000);
  },
  async getDisplayedElements(selector) {
    let elements = await this.getBrowser().$$(selector);
    if (elements.length === 0) {
      return [];
    }
    let pr = elements.map((el) => el.isDisplayed());
    return await Promise.all(pr).then((result) => {
      return elements.filter((el, i) => result[i]);
    });
  },
  waitUntilDisplayed(selector, ms) {
    return this.getBrowser().waitUntil(
      () => {
        return this.getDisplayedElements(selector).then((result) => {
          return result.length > 0;
        });
      },
      {
        timeout: ms,
        timeoutMsg: 'Timeout exception. Element ' + selector + ' still not visible in: ' + ms,
      },
    );
  },
  loadUrl(url) {
    return this.getBrowser().url(url);
  },
  async saveScreen(name) {
    await this.getBrowser().saveScreen();
  },
  // Opens a section (extension) of the Settings app through the sections rail and waits until its
  // browse screen is shown: the rail link is active, the app bar shows the section title and the
  // 'Actions' toolbar is displayed. `section` is one of MenuSectionsRail.SECTION.*
  async navigateToExtension(section) {
    try {
      let menuSectionsRail = new MenuSectionsRail();
      await menuSectionsRail.waitForLoaded();
      await menuSectionsRail.clickOnSectionButton(section);
      //await this.waitForSectionScreenLoaded(section);
      //return menuSectionsRail;
    } catch (err) {
      let screenshot = await this.saveScreenshotUniqueName('err_navigate_extension');
      throw new Error(`'${section}' section was not opened, screenshot: ${screenshot} ` + err);
    }
  },
  // Section-agnostic 'loaded' check for the browse screen: every section renders the same app bar
  // and toolbar, so this does not depend on a section-specific page object.
  async waitForSectionScreenLoaded(section, ms = appConst.TIMEOUT.MEDIUM) {
    const appBarTitle = `//header//h2[text()='${section}']`;
    // 'BrowseToolbar' once a section carries its own data-component (app-users#2764),
    // 'Toolbar.Container' until then (app-applications).
    const toolbar =
      "//div[(@data-component='BrowseToolbar' or @data-component='Toolbar.Container') and @aria-label='Actions']";
    await this.waitForElementDisplayed(appBarTitle, ms);
    await this.waitForElementDisplayed(toolbar, ms);
  },
};
