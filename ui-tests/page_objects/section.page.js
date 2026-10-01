/**
 * Created on 24.09.2026
 */
const Page = require('./page');
const appConst = require('../libs/app_const');

// Every Settings section (extension) is rendered inside its own shadow root:
//
//   div[data-component='SectionMount'][data-section='<app>:<section>'] (class 'hidden' when inactive)
//     div[data-component='SectionMountHost']   <- the shadow host
//       #shadow-root
//         div[data-component='AppRoot'] > div[data-component='<Section>Page'] ...
//
// Chrome cannot evaluate XPath with a shadow root as the context node ("#document-fragment is not a
// valid context node type"), over WebDriver Classic and BiDi alike. So everything below the shadow
// root is located with CSS, and this class scopes every lookup to the active section's shadow host
// with webdriverio's deep selector (`>>>`), which pierces shadow roots in both protocols. Inactive
// sections stay mounted with class 'hidden', hence the scoping: a page-wide lookup could otherwise
// hit a button in a section that was opened earlier.
//
// `findElement`/`findElements` are overridden, and every helper inherited from Page
// (waitForElementDisplayed, waitForElementEnabled, clickOnElement, getText, ...) goes through them,
// so section page objects just pass CSS selectors to the usual helpers.
const DEEP = '>>> ';

class SectionPage extends Page {
  constructor(sectionId) {
    super();
    this.sectionId = sectionId;
  }

  // CSS (light DOM) of the shadow host of this section, excluding hidden (inactive) mounts.
  get shadowHostLocator() {
    return (
      `div[data-component='SectionMount'][data-section='${this.sectionId}']:not(.hidden)` +
      " div[data-component='SectionMountHost']"
    );
  }

  async getShadowHost(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      const host = await this.browser.$(this.shadowHostLocator);
      await host.waitForExist({ timeout: ms });
      return host;
    } catch (err) {
      await this.handleError(
        `Section '${this.sectionId}' - failed to get the shadow host`,
        'err_section_shadow_host',
        err,
      );
    }
  }

  // Scoped to the section: `cssSelector` is resolved from the shadow host, through its shadow root.
  async findElement(cssSelector) {
    const host = await this.getShadowHost();
    return await host.$(DEEP + cssSelector);
  }

  async findElements(cssSelector) {
    const host = await this.getShadowHost();
    return await host.$$(DEEP + cssSelector);
  }

  // Page-wide lookup for the rare element that is rendered outside the section's shadow root
  // (app shell, notifications). Takes any selector Page accepts, XPath included.
  findElementInDocument(selector) {
    return this.browser.$(selector);
  }

  findElementsInDocument(selector) {
    return this.browser.$$(selector);
  }
}

module.exports = SectionPage;
