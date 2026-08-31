import { connectAdminEvents, subscribeTopic } from '../shared/admin-events';
import { $config } from '../shared/config';
import { HUB_TOPICS } from '../shared/sections';
import type { Section } from './section';

/** One module instance can serve several mounted sections, so each holds its own subscription. */
const subscriptions = new Map<Section, () => void>();

/**
 * Connects a section to the hub's `principals` topic.
 * ? What a section does with a message is still open (#2656); until then it is only logged.
 */
export function startSectionEvents(section: Section): void {
  if (subscriptions.has(section)) {
    return;
  }

  const eventsUrl = $config.get()?.eventsUrl;
  if (eventsUrl == null) {
    return;
  }

  connectAdminEvents(eventsUrl);

  // TODO: Temporary logging until the sections decide what a message means to them.
  subscriptions.set(
    section,
    subscribeTopic(HUB_TOPICS.principals, {
      onMessage: (data) => {
        console.log(`[${section}] principals message:`, data);
      },
      onLoss: (count) => {
        console.log(`[${section}] principals loss:`, count);
      },
    }),
  );
}

export function stopSectionEvents(section: Section): void {
  const unsubscribe = subscriptions.get(section);
  subscriptions.delete(section);
  unsubscribe?.();
}
