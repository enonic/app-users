import EventJson = api.event.EventJson;
import {ReportServerEvent} from './ReportServerEvent';

export class UsersServerEventsListener
    extends api.event.ServerEventsListener {

    protected onUnknownServerEvent(eventJson: EventJson) {
        const eventType: string = eventJson.type;

        if (!eventType || eventType.indexOf('node.') !== 0) {
            return;
        }

        if (ReportServerEvent.is(<api.event.NodeEventJson>eventJson)) {
            const event: ReportServerEvent = ReportServerEvent.fromJson(<api.event.NodeEventJson>eventJson);
            this.fireEvent(event);
        }
    }
}
