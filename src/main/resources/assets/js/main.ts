import i18n = api.util.i18n;

declare const CONFIG;
api.util.i18nInit(CONFIG.messages);

const body = api.dom.Body.get();

import './api.ts';
import {UserAppPanel} from './app/UserAppPanel';
import {ChangeUserPasswordDialog} from './app/wizard/ChangeUserPasswordDialog';
import {Router} from './app/Router';
import {ShowNewPrincipalDialogEvent} from './app/browse/ShowNewPrincipalDialogEvent';
import {NewPrincipalDialog} from './app/create/NewPrincipalDialog';
import {PrincipalServerEventsHandler} from './app/event/PrincipalServerEventsHandler';

function getApplication(): api.app.Application {
    let application = new api.app.Application('user-manager', 'Users', 'UM', CONFIG.appIconUrl);
    application.setPath(api.rest.Path.fromString(Router.getPath()));
    application.setWindow(window);

    return application;
}

function startLostConnectionDetector() {
    let messageId;
    let lostConnectionDetector = new api.system.ConnectionDetector();
    lostConnectionDetector.setAuthenticated(true);
    lostConnectionDetector.onConnectionLost(() => {
        api.notify.NotifyManager.get().hide(messageId);
        messageId = api.notify.showError(i18n('notify.connection.loss'), false);
    });
    lostConnectionDetector.onSessionExpired(() => {
        api.notify.NotifyManager.get().hide(messageId);
        window.location.href = api.util.UriHelper.getToolUri('');
    });
    lostConnectionDetector.onConnectionRestored(() => {
        api.notify.NotifyManager.get().hide(messageId);
    });

    lostConnectionDetector.startPolling();
}

function startApplication() {

    let application: api.app.Application = getApplication();
    let appBar = new api.app.bar.TabbedAppBar(application);
    appBar.setHomeIconAction();
    let appPanel = new UserAppPanel(appBar, application.getPath());

    body.appendChild(appBar);
    body.appendChild(appPanel);

    api.util.AppHelper.preventDragRedirect();

    // tslint:disable-next-line:no-unused-expression
    new ChangeUserPasswordDialog();
    application.setLoaded(true);

    let serverEventsListener = new api.app.ServerEventsListener([application]);
    serverEventsListener.start();

    startLostConnectionDetector();

    PrincipalServerEventsHandler.getInstance().start();

    const newPrincipalDialog = new NewPrincipalDialog();
    ShowNewPrincipalDialogEvent.on((event) => {
        newPrincipalDialog.setSelection(event.getSelection()).open();
    });
}

const renderListener = () => {
    startApplication();
    body.unRendered(renderListener);
};

if (body.isRendered()) {
    renderListener();
} else {
    body.onRendered(renderListener);
}
