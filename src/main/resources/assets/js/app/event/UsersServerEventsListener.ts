import {EventJson} from 'lib-admin-ui/event/EventJson';
import {ReportServerEvent} from './ReportServerEvent';
import {ServerEventsListener} from 'lib-admin-ui/event/ServerEventsListener';
import {NodeEventJson} from 'lib-admin-ui/event/NodeServerEvent';
import {Application} from 'lib-admin-ui/app/Application';
import {UsersServerEventsTranslator} from './UsersServerEventsTranslator';

export class UsersServerEventsListener
    extends ServerEventsListener {

    constructor(applications: Application[]) {
        super(applications);

        this.setServerEventsTranslator(new UsersServerEventsTranslator());
    }

    protected onUnknownServerEvent(eventJson: EventJson) {
        const eventType: string = eventJson.type;

        if (!eventType || eventType.indexOf('node.') !== 0) {
            return;
        }

        if (ReportServerEvent.is(<NodeEventJson>eventJson)) {
            const event: ReportServerEvent = ReportServerEvent.fromJson(<NodeEventJson>eventJson);
            this.fireEvent(event);
        }
    }
}
