import { startGroupsEvents, stopGroupsEvents } from '../pages/groups/model/groups.service';
import {
  startIdProvidersEvents,
  stopIdProvidersEvents,
} from '../pages/id-providers/model/id-providers.service';
import { startRolesEvents, stopRolesEvents } from '../pages/roles/model/roles.service';
import { startUsersEvents, stopUsersEvents } from '../pages/users/model/users.service';
import { connectAdminEvents } from '../shared/admin-events';
import { $config } from '../shared/config';
import type { HostFrame } from '../shared/host';
import type { Section } from './section';

type SectionEvents = {
  start: (frame: HostFrame) => void;
  stop: () => void;
};

/** One module instance can serve several mounted sections, so each keeps its own subscription. */
const SERVICES: Record<Section, SectionEvents> = {
  users: { start: startUsersEvents, stop: stopUsersEvents },
  groups: { start: startGroupsEvents, stop: stopGroupsEvents },
  roles: { start: startRolesEvents, stop: stopRolesEvents },
  'id-providers': { start: startIdProvidersEvents, stop: stopIdProvidersEvents },
};

export function startSectionEvents(section: Section, frame: HostFrame): void {
  const eventsUrl = $config.get()?.eventsUrl;
  if (eventsUrl == null) {
    return;
  }

  connectAdminEvents(eventsUrl);
  SERVICES[section].start(frame);
}

export function stopSectionEvents(section: Section): void {
  SERVICES[section].stop();
}
