import type { ReadableAtom } from 'nanostores';

import {
  createTopicReaction,
  HUB_TOPICS,
  toApplicationsMessage,
  type TopicReaction,
} from '../../../shared/admin-events';

/**
 * Re-reads a screen whose providers' modes may have moved: a provider's mode is its application's
 * descriptor, so starting, stopping, installing or removing an application can change it with no
 * principal event at all. Any application, not only a bound one — the names carry no application key,
 * and lifecycle events are rare enough that one re-read each costs nothing.
 *
 * ! The topic is admitted to `system.admin` alone, so a delegated `user.admin` gets no messages and sees
 * ! a mode change on its next reload — the same trade the host's rail makes on that topic.
 */
export function createIdProviderModeReaction(
  $visible: ReadableAtom<boolean>,
  refresh: () => void,
): TopicReaction {
  return createTopicReaction({
    topic: HUB_TOPICS.applications,
    parse: toApplicationsMessage,
    $visible,
    apply: refresh,
    refresh,
  });
}
