import {EventJson} from 'lib-admin-ui/event/EventJson';
import {Event} from 'lib-admin-ui/event/Event';
import {NodeEventJson} from 'lib-admin-ui/event/NodeServerEvent';
import {ServerEventsTranslator} from 'lib-admin-ui/event/ServerEventsTranslator';
import {PrincipalServerEvent} from './PrincipalServerEvent';

export class UsersServerEventsTranslator
    extends ServerEventsTranslator {

    translateServerEvent(eventJson: EventJson): Event {
        const eventType: string = eventJson.type;

        if (eventType.indexOf('node.') === 0) {
            if (PrincipalServerEvent.is(<NodeEventJson>eventJson)) {
                return PrincipalServerEvent.fromJson(<NodeEventJson>eventJson);
            }

        }

        return super.translateServerEvent(eventJson);
    }

}
