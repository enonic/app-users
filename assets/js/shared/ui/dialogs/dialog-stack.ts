import { useEffect, useState } from 'preact/hooks';

export type DialogLayer = {
  blocked: boolean;
  nested: boolean;
};

export function layerOf(stack: readonly number[], id: number): DialogLayer {
  const index = stack.indexOf(id);

  return {
    blocked: index !== -1 && index < stack.length - 1,
    nested: index > 0,
  };
}

let stack: readonly number[] = [];
let nextId = 0;

const listeners = new Set<() => void>();

function announce(): void {
  listeners.forEach((listener) => listener());
}

export function useDialogLayer(open: boolean): DialogLayer {
  const [id] = useState(() => {
    nextId += 1;
    return nextId;
  });
  const [, rerender] = useState(0);

  useEffect(() => {
    const listener = (): void => rerender((count) => count + 1);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    stack = [...stack, id];
    announce();

    return () => {
      stack = stack.filter((candidate) => candidate !== id);
      announce();
    };
  }, [open, id]);

  return layerOf(stack, id);
}

const CLICK_OUTSIDE_IGNORE = { 'data-click-outside-ignore': '' } as const;

/**
 * For the overlay of a dialog that opens over another. A nested overlay masks what is under it by
 * sitting on `z-40` — the z the library hardcodes on the wrapper around every dialog's content — so
 * paint order decides, and DOM order puts it after the open dialog's content and before this
 * dialog's own; a higher z would cover this dialog too, since `className` reaches the inner box, not
 * that wrapper. The attribute keeps a click on the mask from closing the dialog underneath as its
 * own outside-click.
 */
export function overlayLayerProps({ nested }: DialogLayer): {
  className?: string;
  'data-click-outside-ignore'?: '';
} {
  return nested ? { className: 'z-40', ...CLICK_OUTSIDE_IGNORE } : {};
}

/**
 * For the content: the attribute takes it out of the other dialog's outside-click test, and a
 * blocked dialog swallows Escape so the library's per-dialog document listener does not dismiss it
 * along with the one above.
 */
export function contentLayerProps({ nested, blocked }: DialogLayer): {
  'data-click-outside-ignore'?: '';
  onEscapeKeyDown: (event: Event) => void;
} {
  return {
    ...(nested && CLICK_OUTSIDE_IGNORE),
    onEscapeKeyDown: (event) => {
      if (blocked) {
        event.preventDefault();
      }
    },
  };
}
