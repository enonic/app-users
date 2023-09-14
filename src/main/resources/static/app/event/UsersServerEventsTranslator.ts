import {EventJson} from '@enonic/lib-admin-ui/event/EventJson';
import {Event} from '@enonic/lib-admin-ui/event/Event';
import {NodeEventJson} from '@enonic/lib-admin-ui/event/NodeServerEvent';
import {ServerEventsTranslator} from '@enonic/lib-admin-ui/event/ServerEventsTranslator';
import {PrincipalServerEvent} from './PrincipalServerEvent';

export class UsersServerEventsTranslator
    extends ServerEventsTranslator {

    translateServerEvent(eventJson: EventJson): Event {
        const eventType: string = eventJson.type;

        if (eventType.indexOf('node.') === 0) {
            if (PrincipalServerEvent.is(eventJson as NodeEventJson)) {
                return PrincipalServerEvent.fromJson(eventJson as NodeEventJson);
            }

        }

        return super.translateServerEvent(eventJson);
    }

}
