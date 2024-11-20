import {EventJson} from '@enonic/lib-admin-ui/event/EventJson';
import {ReportServerEvent} from './ReportServerEvent';
import {ServerEventsListener} from '@enonic/lib-admin-ui/event/ServerEventsListener';
import {NodeEventJson} from '@enonic/lib-admin-ui/event/NodeServerEvent';
import {Application} from '@enonic/lib-admin-ui/app/Application';
import {UsersServerEventsTranslator} from './UsersServerEventsTranslator';

export class UsersServerEventsListener
    extends ServerEventsListener {

    constructor(applications: Application[], eventApiUrl: string) {
        super(applications, eventApiUrl);

        this.setServerEventsTranslator(new UsersServerEventsTranslator());
    }

    protected onUnknownServerEvent(eventJson: EventJson) {
        const eventType: string = eventJson.type;

        if (!eventType || eventType.indexOf('node.') !== 0) {
            return;
        }

        if (ReportServerEvent.is(eventJson as NodeEventJson)) {
            const event = ReportServerEvent.fromJson(eventJson as NodeEventJson);
            this.fireEvent(event);
        }
    }
}
