/**
 * Created on 24.09.2026
 */
const Page = require('./page');
const appConst = require('../libs/app_const');

// A section is rendered inside its own shadow root, attached to the SectionMount element itself
// (app-settings docs/extensions/host-facts.md): it carries data-section and, on the visible one,
// data-status='active'. Chrome cannot evaluate XPath below a shadow root, so every lookup here is
// CSS, scoped to the active section's host through webdriverio's deep selector. Inactive sections
// stay mounted, without the status; the 'hidden' class sits on their wrapper, not on the host.
const DEEP = '>>> ';

class SectionPage extends Page {
  constructor(sectionId) {
    super();
    this.sectionId = sectionId;
  }

  get shadowHostLocator() {
    return `div[data-component='SectionMount'][data-section='${this.sectionId}'][data-status='active']`;
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

  async findElement(cssSelector) {
    const host = await this.getShadowHost();
    return await host.$(DEEP + cssSelector);
  }

  async findElements(cssSelector) {
    const host = await this.getShadowHost();
    return await host.$$(DEEP + cssSelector);
  }

  // Light DOM, outside every section (the app shell, the toasts); XPath works here.
  findElementInDocument(selector) {
    return this.browser.$(selector);
  }

  findElementsInDocument(selector) {
    return this.browser.$$(selector);
  }
}

module.exports = SectionPage;
