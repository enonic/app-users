import { h, render } from 'preact';

import { App } from './app/App';
import { bootstrap } from './app/bootstrap';
import { sectionOf } from './app/section';
import { createHostFrame } from './shared/host';
import type { MountOptions, SectionHost, Unmount } from './shared/sections';

/** Renders the section into the container the host owns, inside the shadow root it created. */
export function mount({ container, host }: MountOptions<SectionHost>): Unmount {
  const section = sectionOf(host.baseUrl);

  if (section === undefined) {
    console.error(`No section in this module answers to ${host.baseUrl}`);
    return () => undefined;
  }

  // Everything derived from the host lives on the frame — one per mount, never at module level.
  const frame = createHostFrame(host);

  // ! Not awaited. `mount` owes the shell its disposer synchronously, so the section paints while its
  // ! own configuration is still in flight and `$bootstrap` is what moves it on.
  void bootstrap(host);

  render(h(App, { frame, section }), container);

  return () => {
    // The components go first: their cleanups may still speak to the frame.
    render(null, container);
    frame.dispose();
  };
}
