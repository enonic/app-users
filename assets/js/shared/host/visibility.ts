import { atom, type ReadableAtom } from 'nanostores';

export type Visibility = {
  $visible: ReadableAtom<boolean>;
  dispose: () => void;
};

/**
 * The shell hides a section it keeps mounted with `display: none`, and the contract carries no signal for
 * it — so the DOM is watched: an element that is not rendered intersects nothing.
 */
export function observeVisibility(container: Element): Visibility {
  const $visible = atom(true);

  if (typeof IntersectionObserver === 'undefined') {
    return { $visible, dispose: () => undefined };
  }

  const observer = new IntersectionObserver((entries) => {
    const last = entries.at(-1);
    if (last !== undefined) {
      $visible.set(last.isIntersecting);
    }
  });
  observer.observe(boxOf(container));

  return { $visible, dispose: () => observer.disconnect() };
}

// ! The container is a `display: contents` wrapper inside a shadow root: no box, so it never intersects and
// ! the section would count as hidden for good. The shadow host has a box, and it is what the shell hides.
function boxOf(container: Element): Element {
  const root = container.getRootNode();
  return root instanceof ShadowRoot ? root.host : container;
}
