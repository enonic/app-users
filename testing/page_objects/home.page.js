/**
 * Created on 6/19/2017.
 */

const Page = require('./page');
const appConst = require('../libs/app_const');

const xpTourDialog = {
    container: `//div[contains(@id,'ModalDialog') and descendant::h2[contains(.,'Welcome Tour')]]`
};
const home = {
    container: "div[class*='home-main-container']"
};

const selectors = {
    contentStudioLink: 'a[id="com.enonic.app.contentstudio"] span.app-tile-name',
    usersLink: 'a[id="com.enonic.xp.app.users"] span.app-tile-name',
    avatarButton:'button#avatar-button',
};

class HomePage extends Page {

    get closeXpTourButton() {
        return xpTourDialog.container + "//div[@class='cancel-button-top']";
    }

    waitForLoaded() {
        return this.waitForElementDisplayed(`${home.container}`, appConst.mediumTimeout);
    }

    async waitForContentLinkDisplayed(){
        const host = await this.getXpMenuShadowHost();
        const span = await host.shadow$(selectors.contentStudioLink);
        await span.waitForDisplayed({timeout: appConst.mediumTimeout});
    }

    async waitForUsersLinkDisplayed(){
        const host = await this.getXpMenuShadowHost();
        const span = await host.shadow$(selectors.usersLink);
        await span.waitForDisplayed({timeout: appConst.mediumTimeout});
    }

    async clickOnContentStudioLink() {
        try {
            const host = await this.getXpMenuShadowHost();
            const span = await host.shadow$(selectors.contentStudioLink);
            await span.waitForDisplayed({timeout: appConst.mediumTimeout});
            await span.click();
        } catch (err) {
            await this.handleError('Content Studio link was not found', 'err_content_studio_link', err);
        }
    }

    async clickOnUsersLink() {
        try {
            const host = await this.getXpMenuShadowHost();
            const span = await host.shadow$(selectors.usersLink);
            await span.waitForDisplayed({timeout: appConst.mediumTimeout});
            await span.click();
        } catch (err) {
            await this.handleError('Users link was not found', 'err_users_link', err);
        }
    }
}
module.exports = HomePage;
