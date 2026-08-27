import { Selector } from '@enonic/ui';
import type { ReactNode } from 'react';

export type SelectorPopupProps = {
  /** `Selector.Item`s, which the popup scrolls. */
  children: ReactNode;
};

/**
 * The list a `Selector.Root` drops down, safe to use inside a dialog.
 *
 * ! Without `data-click-outside-ignore` a dialog closes on the *second* pick from any selector inside
 * ! it: `Selector.Content` registers its portalled element with the dialog once, then renders `null`
 * ! while closed instead of unmounting, so the second popup is an element the dialog does not know and
 * ! the pick reads as a click outside. `Combobox` unmounts its popup, which is why `PrincipalPicker` is
 * ! fine. The selector still dismisses itself: its own test uses its own ref.
 */
export function SelectorPopup({ children }: SelectorPopupProps) {
  return (
    <Selector.Content data-click-outside-ignore>
      <Selector.Viewport>{children}</Selector.Viewport>
    </Selector.Content>
  );
}
