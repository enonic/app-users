/**
 * Created by on 6/26/2017.
 */
const Page = require('./page');
const appConst = require('../libs/app_const');
const XPATH = {
    container: `//div[contains(@class,'launcher-panel')]`,
};
class LauncherPanel extends Page {

    get homeLink() {
        return XPATH.container + "//a[contains(@data-id,'home')]";
    }

    get usersLink() {
        return XPATH.container + "//a[contains(@data-id,'app.users')]//p[@class='app-name']";
    }


    get contentStudioLink() {
        return XPATH.container + "//a[contains(@data-id,'contentstudio')]";
    }

    get applicationsLink() {
        return XPATH.container + "//a[contains(@data-id,'app.applications')]";
    }

    get logoutLink() {
        return XPATH.container + "//div[@class='user-logout']";
    }

    async clickOnUsersLink() {
        await this.waitForElementDisplayed(this.usersLink, appConst.mediumTimeout);
        await this.pause(400);
        return await this.clickOnElement(this.usersLink);
    }

    clickOnLogoutLink() {
        return this.clickOnElement(this.logoutLink);
    }

    waitForPanelDisplayed(ms) {
        return this.waitForElementDisplayed(XPATH.container, ms).catch(err => {
            return false;
        })
    }

    isApplicationsLinkDisplayed() {
        return this.waitForElementDisplayed(this.applicationsLink, appConst.shortTimeout).catch(err => {
            return false;
        })
    }

    isUsersLinkDisplayed() {
        return this.waitForElementDisplayed(this.usersLink, appConst.mediumTimeout).catch(err => {
            return false;
        })
    }
}
module.exports = LauncherPanel;

