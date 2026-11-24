const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const MenuSectionsRail = require('../page_objects/menu.sections.rail');

describe('content.security.policy.spec - no section of app-users violates the Content-Security-Policy the Settings page is served with', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // The sections this app adds. The policy itself is the shell's, and its header is tested there
  // (app-settings); 'Applications' is tested in app-applications.
  const SECTIONS = [
    appConst.EXTENSIONS.SERVICE_ACCOUNTS,
    appConst.EXTENSIONS.USERS,
    appConst.EXTENSIONS.GROUPS,
    appConst.EXTENSIONS.ROLES,
    appConst.EXTENSIONS.ID_PROVIDERS,
  ];
  // How Chrome words a violation in its log: "Refused to load the image '...' because it violates
  // the following Content Security Policy directive: ...".
  const VIOLATION = /Content Security Policy/i;

  // The violations logged since the last read, as their messages.
  async function readViolations() {
    const logs = await settingsUtils.getBrowserLogs();
    return logs.map((entry) => entry.message).filter((message) => VIOLATION.test(message));
  }

  it('GIVEN SU is logged in WHEN every section of Users has been opened, by its direct link and by its rail item THEN no Content-Security-Policy violation should be logged', async () => {
    let menuSectionsRail = new MenuSectionsRail();
    await settingsUtils.navigateToSettingsApp('su', 'password');
    // 1. Start from an empty log.
    await settingsUtils.getBrowserLogs();
    const violations = [];
    // 2. Load the page at each section: the section's module, cold.
    for (const section of SECTIONS) {
      await settingsUtils.openSectionByUrl(section);
      await settingsUtils.waitForSectionScreenLoaded(section);
      violations.push(...(await readViolations()).map((message) => `${section}: ${message}`));
    }
    // 3. Walk the rail in one page: every section mounted side by side.
    for (const section of SECTIONS) {
      await menuSectionsRail.clickOnSectionButton(section);
      await settingsUtils.waitForSectionScreenLoaded(section);
      violations.push(...(await readViolations()).map((message) => `${section}: ${message}`));
    }
    assert.deepEqual(violations, [], 'Content-Security-Policy violations were logged');
  });

  it('GIVEN a section of Users is opened WHEN the page has requested an image from another origin THEN the request should be refused AND the violation should be logged', async () => {
    await settingsUtils.getBrowserLogs();
    // 1. An image from a host the policy does not name: refused before any request is made.
    await settingsUtils.getBrowser().execute(() => {
      const image = document.createElement('img');
      image.src = 'https://csp-control.invalid/pixel.png';
      document.body.appendChild(image);
      image.remove();
    });
    // 2. Verify that the violation is in the log.
    let violations = [];
    await settingsUtils.getBrowser().waitUntil(
      async () => {
        violations.push(...(await readViolations()));
        return violations.length > 0;
      },
      {
        timeout: appConst.TIMEOUT.MEDIUM,
        timeoutMsg: 'The refused image should be logged as a Content-Security-Policy violation',
      },
    );
    assert.ok(
      violations.some((message) => message.includes('csp-control.invalid')),
      `The violation should name the refused url: ${violations.join(' | ')}`,
    );
  });
});
