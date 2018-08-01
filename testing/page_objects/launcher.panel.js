/**
 * Created by on 6/26/2017.
 */
const page = require('./page');
const appConst = require('../libs/app_const');
const panel = {
    container: `//div[contains(@class,'launcher-main-container')]`
};

const launcherPanel = Object.create(page, {
    /**
     * define elements
     */
    homeLink: {
        get: function () {
            return `${panel.container}` + `//a[contains(@data-id,'home')]`;
        }
    },
    applicationsLink: {
        get: function (userName) {
            return `${panel.container}` + `//a[contains(@data-id,'app.applications')]`;
        }
    },
    contentStudioLink: {
        get: function () {
            return `${panel.container}` + `//a[contains(@data-id,'app.contentstudio')]`;
        }
    },
    usersLink: {
        get: function () {
            return `${panel.container}` + `//a[contains(@data-id,'app.users')]`;
        }
    },

    logoutLink: {
        get: function () {
            return `${panel.container}` + `//div[@class='user-logout']`;
        }
    },

    clickOnUsersLink: {
        value: function () {
            return this.waitForVisible(this.usersLink, appConst.TIMEOUT_3).then(() => {
                return this.doClick(this.usersLink).catch(err=> {
                    console.log('err when click on Users link' + err);
                    throw new Error(err);
                })
            })
        }
    },
    clickOnLogoutLink: {
        value: function () {
            return this.waitForVisible(this.logoutLink, appConst.TIMEOUT_3).then(() => {
                return this.doClick(this.logoutLink).catch(err=> {
                    console.log('err when click on Log Out link' + err);
                    throw new Error(err);
                })
            }).pause(800);
        }
    },
    waitForPanelVisible: {
        value: function () {
            return this.waitForVisible(`${panel.container}`, appConst.TIMEOUT_3).catch(err => {
                console.log('launcher panel is not loaded ');
                return false;
            })
        }
    },
    isApplicationsLinkDisplayed: {
        value: function () {
            return this.isVisible(this.applicationsLink);
        }
    },
    isUsersLinkDisplayed: {
        value: function () {
            return this.isVisible(this.usersLink);
        }
    },

});
module.exports = launcherPanel;
