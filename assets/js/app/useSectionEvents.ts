import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import { $bootstrap } from './bootstrap.store';
import { startSectionEvents, stopSectionEvents } from './events';
import type { Section } from './section';

/** Connects the section to the hub once its bootstrap is ready; disconnects with the app. */
export function useSectionEvents(section: Section): void {
  const { status } = useStore($bootstrap, { keys: ['status'] });

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    startSectionEvents(section);
    return () => stopSectionEvents(section);
  }, [status, section]);
}
