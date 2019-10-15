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
import {showError} from 'lib-admin-ui/notify/MessageBus';
import {NotifyManager} from 'lib-admin-ui/notify/NotifyManager';
import {i18n} from 'lib-admin-ui/util/Messages';
import {UriHelper} from 'lib-admin-ui/util/UriHelper';
import {TabbedAppBar} from 'lib-admin-ui/app/bar/TabbedAppBar';
import {AppHelper} from 'lib-admin-ui/util/AppHelper';
import {i18nInit} from 'lib-admin-ui/util/MessagesInitializer';

declare const CONFIG;

const body = Body.get();

// Dynamically import and execute all input types, since they are used
// on-demand, when parsing XML schemas and has not real usage in app
declare var require: { context: (directory: string, useSubdirectories: boolean, filter: RegExp) => void };
const importAll = r => r.keys().forEach(r);
importAll(require.context('./app/inputtype', true, /^(?!\.[\/\\]ui).*/));

function getApplication(): Application {
    let application = new Application('user-manager', 'Users', 'UM', CONFIG.appIconUrl);
    application.setPath(Path.fromString(Router.getPath()));
    application.setWindow(window);

    return application;
}

function startLostConnectionDetector() {
    let messageId;
    let lostConnectionDetector = new ConnectionDetector();
    lostConnectionDetector.setAuthenticated(true);
    lostConnectionDetector.onConnectionLost(() => {
        NotifyManager.get().hide(messageId);
        messageId = showError(i18n('notify.connection.loss'), false);
    });
    lostConnectionDetector.onSessionExpired(() => {
        NotifyManager.get().hide(messageId);
        window.location.href = UriHelper.getToolUri('');
    });
    lostConnectionDetector.onConnectionRestored(() => {
        NotifyManager.get().hide(messageId);
    });

    lostConnectionDetector.startPolling();
}

function startApplication() {

    const application: Application = getApplication();
    const appBar = new TabbedAppBar(application);
    appBar.setHomeIconAction();
    const appPanel = new UserAppPanel(appBar, application.getPath());

    body.appendChild(appBar);
    body.appendChild(appPanel);

    AppHelper.preventDragRedirect();

    // tslint:disable-next-line:no-unused-expression
    new ChangeUserPasswordDialog();
    application.setLoaded(true);

    const serverEventsListener = new UsersServerEventsListener([application]);
    serverEventsListener.start();

    startLostConnectionDetector();

    PrincipalServerEventsHandler.getInstance().start();

    const newPrincipalDialog = new NewPrincipalDialog();
    ShowNewPrincipalDialogEvent.on((event) => {
        newPrincipalDialog.setSelection(event.getSelection()).open();
    });
}

const renderListener = () => {
    i18nInit(CONFIG.i18nUrl).then(() => startApplication());
    body.unRendered(renderListener);
};

if (body.isRendered()) {
    renderListener();
} else {
    body.onRendered(renderListener);
}
