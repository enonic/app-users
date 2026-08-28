import { connectAdminEvents, PRINCIPALS_TOPIC, subscribeTopic } from '../shared/admin-events';
import { $config } from '../shared/config';
import type { Section } from './section';

let unsubscribe: (() => void) | undefined;

/**
 * Connects this section to the hub's `principals` topic. The module runs once per section, so each
 * mounted section holds its own subscription.
 * ? What a section does with a message is still open (#2656); until then it is only logged.
 */
export function startSectionEvents(section: Section): void {
  if (unsubscribe != null) {
    return;
  }

  const eventsUrl = $config.get()?.eventsUrl;
  if (eventsUrl == null) {
    return;
  }

  connectAdminEvents(eventsUrl);

  // TODO: Temporary logging until the sections decide what a message means to them.
  unsubscribe = subscribeTopic(PRINCIPALS_TOPIC, {
    onMessage: (data) => {
      console.log(`[${section}] principals message:`, data);
    },
    onLoss: (count) => {
      console.log(`[${section}] principals loss:`, count);
    },
  });
}

export function stopSectionEvents(): void {
  unsubscribe?.();
  unsubscribe = undefined;
}
