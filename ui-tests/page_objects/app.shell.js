const Page = require('./page');
const appConst = require('../libs/app_const');
const assert = require('node:assert');

// What the shell renders around the sections, all light DOM: the app bar with the active section's
// title, and one SectionMount per section visited - the visible one carries data-status='active',
// the others stay mounted in a wrapper with display: none.
const XPATH = {
  appBarTitle: "//header[@data-component='AppBar']//h2",
  themeSwitcher: "//header[@data-component='AppBar']//button[@data-component='ThemeSwitcher']",
};

class AppShell extends Page {
  // The title in the app bar: the active section's.
  async getAppBarTitle() {
    const title = await this.findElement(XPATH.appBarTitle);
    return (await title.getText()).trim();
  }

  async waitForAppBarTitle(expected, ms = appConst.TIMEOUT.MEDIUM) {
    await this.getBrowser().waitUntil(async () => (await this.getAppBarTitle()) === expected, {
      timeout: ms,
      timeoutMsg: `The app bar should be titled '${expected}'`,
    });
  }

  // The browser tab: 'XP Settings / <section>'.
  async waitForDocumentTitle(expected, ms = appConst.TIMEOUT.MEDIUM) {
    await this.getBrowser().waitUntil(async () => (await this.getTitle()) === expected, {
      timeout: ms,
      timeoutMsg: `The browser tab should be titled '${expected}'`,
    });
  }

  async waitForUrl(expected, ms = appConst.TIMEOUT.MEDIUM) {
    let actual;
    await this.getBrowser().waitUntil(
      async () => {
        actual = await this.getBrowser().getUrl();
        return actual === expected;
      },
      { timeout: ms, timeoutMsg: `The url should be '${expected}'` },
    );
  }

  // The sections mounted, in DOM order, as [{ section, active, displayed }]: `section` is the
  // mount's data-section (appConst.SECTION_ID.*), `displayed` is false for one kept hidden.
  getSectionMounts() {
    return this.getBrowser().execute(() =>
      [...document.querySelectorAll("[data-component='SectionMount']")].map((mount) => ({
        section: mount.dataset.section,
        active: mount.dataset.status === 'active',
        displayed: mount.getClientRects().length > 0,
      })),
    );
  }

  async getSectionMount(sectionId) {
    return (await this.getSectionMounts()).find((mount) => mount.section === sectionId);
  }

  // `lang` of the page's <html>: the language the shell's phrases resolved to.
  getHtmlLang() {
    return this.getBrowser().execute(() => document.documentElement.lang);
  }

  // Theme. The switcher in the app bar steps through system → light → dark; its label names the
  // step a click takes ('Switch to light theme', 'Switch to dark theme', 'Use system theme'). The
  // choice is kept in localStorage ('enonic:theme'), absent until the first click.

  getThemeSwitcherLabel() {
    return this.getAttribute(XPATH.themeSwitcher, 'aria-label');
  }

  // 'system', 'light', 'dark', or null while the visitor has not chosen.
  getStoredTheme() {
    return this.getBrowser().execute(() => localStorage.getItem('enonic:theme'));
  }

  async clickOnThemeSwitcher() {
    try {
      const before = await this.getThemeSwitcherLabel();
      await this.clickOnElement(XPATH.themeSwitcher);
      await this.getBrowser().waitUntil(
        async () => (await this.getThemeSwitcherLabel()) !== before,
        { timeout: appConst.TIMEOUT.MEDIUM, timeoutMsg: 'The theme switcher did not step' },
      );
    } catch (err) {
      await this.handleError('Theme switcher', 'err_theme_switcher', err);
    }
  }

  // Clicks the switcher until the stored choice is `theme` ('system', 'light' or 'dark').
  async selectTheme(theme) {
    for (let step = 0; step < 3; step++) {
      if ((await this.getStoredTheme()) === theme) {
        return;
      }
      await this.clickOnThemeSwitcher();
    }
    assert.equal(await this.getStoredTheme(), theme, 'The theme the switcher was stepped to');
  }

  // Forgets the visitor's choice, so the next load starts from the system theme.
  clearStoredTheme() {
    return this.getBrowser().execute(() => localStorage.removeItem('enonic:theme'));
  }

  // Whether the shell is dark: the 'dark' class on <html>, which its own styles hang on.
  isShellDark() {
    return this.getBrowser().execute(() => document.documentElement.classList.contains('dark'));
  }

  // The colour the app bar is painted in, as the browser computed it.
  getAppBarBackgroundColor() {
    return this.getBrowser().execute(
      () =>
        getComputedStyle(document.querySelector("header[data-component='AppBar']")).backgroundColor,
    );
  }

  // How the theme reached a mounted section, shown or kept hidden: { dark, color }. A section's
  // styles cannot see the shell's <html>, so it puts the class on its own root inside the shadow
  // root (AppRoot) from what `host.theme` tells it; `color` is the text colour computed there.
  // Undefined while the section is not mounted.
  getSectionTheme(sectionId) {
    return this.getBrowser().execute((id) => {
      const mount = document.querySelector(`[data-component='SectionMount'][data-section='${id}']`);
      const root = mount?.shadowRoot?.querySelector("[data-component='AppRoot']");
      if (!root) {
        return undefined;
      }
      return { dark: root.classList.contains('dark'), color: getComputedStyle(root).color };
    }, sectionId);
  }

  async waitForSectionDark(sectionId, dark, ms = appConst.TIMEOUT.MEDIUM) {
    await this.getBrowser().waitUntil(
      async () => (await this.getSectionTheme(sectionId))?.dark === dark,
      {
        timeout: ms,
        timeoutMsg: `Section '${sectionId}' should ${dark ? '' : 'not '}be dark`,
      },
    );
  }
}

module.exports = AppShell;
