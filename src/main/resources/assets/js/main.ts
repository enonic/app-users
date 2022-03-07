import {UserAppPanel} from './app/UserAppPanel';
import {ChangeUserPasswordDialog} from './app/wizard/ChangeUserPasswordDialog';
import {Router} from './app/Router';
import {ShowNewPrincipalDialogEvent} from './app/browse/ShowNewPrincipalDialogEvent';
import {NewPrincipalDialog} from './app/create/NewPrincipalDialog';
import {PrincipalServerEventsHandler} from './app/event/PrincipalServerEventsHandler';
import {UsersServerEventsListener} from './app/event/UsersServerEventsListener';
import {Body} from 'lib-admin-ui/dom/Body';
import {Application} from 'lib-admin-ui/app/Application';
import {Path} from 'lib-admin-ui/rest/Path';
import {ConnectionDetector} from 'lib-admin-ui/system/ConnectionDetector';
import {i18n} from 'lib-admin-ui/util/Messages';
import {TabbedAppBar} from 'lib-admin-ui/app/bar/TabbedAppBar';
import {AppHelper} from 'lib-admin-ui/util/AppHelper';
import {i18nInit} from 'lib-admin-ui/util/MessagesInitializer';
import {CONFIG} from 'lib-admin-ui/util/Config';
import {PrincipalSelector} from './app/inputtype/selector/PrincipalSelector';
import {InputTypeManager} from 'lib-admin-ui/form/inputtype/InputTypeManager';
import {Class} from 'lib-admin-ui/Class';

const body = Body.get();

// Dynamically import and execute all input types, since they are used
// on-demand, when parsing XML schemas and has not real usage in app
declare let require: { context: (directory: string, useSubdirectories: boolean, filter: RegExp) => void };
const importAll = r => r.keys().forEach(r);
importAll(require.context('./app/inputtype', true, /^(?!\.[\/\\]ui).*/));

function getApplication(): Application {
    const assetsUri: string = CONFIG.getString('assetsUri');
    const application = new Application(
        CONFIG.getString('appId'),
        i18n('admin.tool.displayName'),
        i18n('app.abbr'),
        `${assetsUri}/icons/icon-white.svg`
    );
    application.setPath(Path.fromString(Router.getPath()));
    application.setWindow(window);

    return application;
}

function startLostConnectionDetector() {
    ConnectionDetector.get()
        .setAuthenticated(true)
        .setSessionExpireRedirectUrl(CONFIG.getString('toolUri'))
        .setNotificationMessage(i18n('notify.connection.loss'))
        .startPolling(true);
}

function startApplication() {

    const application: Application = getApplication();
    const appBar = new TabbedAppBar(application);
    appBar.setHomeIconAction();

    const newPrincipalDialog = new NewPrincipalDialog();
    const appPanel = new UserAppPanel(appBar, application.getPath());

    body.appendChild(appBar);
    body.appendChild(appPanel);

    AppHelper.preventDragRedirect();

    new ChangeUserPasswordDialog();
    application.setLoaded(true);

    const serverEventsListener = new UsersServerEventsListener([application]);
    serverEventsListener.start();

    startLostConnectionDetector();

    PrincipalServerEventsHandler.getInstance().start();

    ShowNewPrincipalDialogEvent.on((event) => {
        newPrincipalDialog.setSelection(event.getSelection()).open();
    });
}

(async () => {
    if (!document.currentScript) {
        throw 'Legacy browsers are not supported';
    }
    const configServiceUrl = document.currentScript.getAttribute('data-config-service-url');
    if (!configServiceUrl) {
        throw 'Unable to fetch app config';
    }
    await CONFIG.init(configServiceUrl);
    await i18nInit(CONFIG.getString('services.i18nUrl'));
    startApplication();
})();

InputTypeManager.register(new Class('PrincipalSelector', PrincipalSelector), true);
