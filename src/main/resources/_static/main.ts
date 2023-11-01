import {Store} from '@enonic/lib-admin-ui/store/Store';
import {StyleHelper} from '@enonic/lib-admin-ui/StyleHelper';

import '@enonic/lib-admin-ui/form/inputtype/support/NoInputTypeFoundView';
import '@enonic/lib-admin-ui/form/inputtype/checkbox/Checkbox';
import '@enonic/lib-admin-ui/form/inputtype/combobox/ComboBox';
import '@enonic/lib-admin-ui/form/inputtype/time/Date';
import '@enonic/lib-admin-ui/form/inputtype/time/DateTime';
import '@enonic/lib-admin-ui/form/inputtype/time/DateTimeRange';
import '@enonic/lib-admin-ui/form/inputtype/time/Time';
import '@enonic/lib-admin-ui/form/inputtype/number/Double';
import '@enonic/lib-admin-ui/form/inputtype/number/Long';
import '@enonic/lib-admin-ui/form/inputtype/geo/GeoPoint';
import '@enonic/lib-admin-ui/form/inputtype/principal/PrincipalSelector';
import '@enonic/lib-admin-ui/form/inputtype/radiobutton/RadioButton';
import '@enonic/lib-admin-ui/form/inputtype/text/TextArea';
import '@enonic/lib-admin-ui/form/inputtype/text/TextLine';

import {UserAppPanel} from './app/UserAppPanel';
import {ChangeUserPasswordDialog} from './app/wizard/ChangeUserPasswordDialog';
import {Router} from './app/Router';
import {ShowNewPrincipalDialogEvent} from './app/browse/ShowNewPrincipalDialogEvent';
import {NewPrincipalDialog} from './app/create/NewPrincipalDialog';
import {PrincipalServerEventsHandler} from './app/event/PrincipalServerEventsHandler';
import {UsersServerEventsListener} from './app/event/UsersServerEventsListener';

import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {Application} from '@enonic/lib-admin-ui/app/Application';
import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {ConnectionDetector} from '@enonic/lib-admin-ui/system/ConnectionDetector';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {TabbedAppBar} from '@enonic/lib-admin-ui/app/bar/TabbedAppBar';
import {AppHelper} from '@enonic/lib-admin-ui/util/AppHelper';
import {i18nInit} from '@enonic/lib-admin-ui/util/MessagesInitializer';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {InputTypeManager} from '@enonic/lib-admin-ui/form/inputtype/InputTypeManager';
import {Class} from '@enonic/lib-admin-ui/Class';
import {
    AuthApplicationSelector,
    PrincipalSelector
} from './app/inputtype/';

const hasJQuery = Store.instance().has('$');
if (!hasJQuery) {
    Store.instance().set('$', $);
}

StyleHelper.setCurrentPrefix(StyleHelper.ADMIN_PREFIX);

const body = Body.get();

InputTypeManager.register(new Class('AuthApplicationSelector', AuthApplicationSelector));
InputTypeManager.register(new Class('PrincipalSelector', PrincipalSelector));

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
    const appBar = new TabbedAppBar(application, true);

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
