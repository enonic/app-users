import {EventJson} from 'lib-admin-ui/event/EventJson';
import {ReportServerEvent} from './ReportServerEvent';
import {ServerEventsListener} from 'lib-admin-ui/event/ServerEventsListener';
import {NodeEventJson} from 'lib-admin-ui/event/NodeServerEvent';

export class UsersServerEventsListener
    extends ServerEventsListener {

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
