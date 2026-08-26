---
paths:
  - '**/*.tsx'
---

# @enonic/ui and Tailwind

Read the component source before using a compound component from `@enonic/ui` — several fail
silently rather than at typecheck. Source: `../npm-enonic-ui/src/components/`; installed types:
`node_modules/@enonic/ui/dist/types/components/`.

## Components that need exact composition

- **`SearchField` renders only `{children}`.** There is no default input — `<SearchField value
onChange />` with no children is an empty bordered box. Compose `<SearchField.Icon />`,
  `<SearchField.Input />`, `<SearchField.Clear />`. `SearchField.Input` hardcodes
  `aria-label='Search'` before spreading props, so an override works.
- **`ListItem` uses `findComponentByType`** and renders only `ListItem.Left`,
  `ListItem.Content` / `ListItem.DefaultContent` and `ListItem.Right`, in that order. Any other
  child is dropped silently.
- **`SelectableListItem` is just `ListItem` + a `Checkbox` in `Left`** with no way to stop the
  checkbox click from bubbling. `ListItem` fits a static list — the details panel uses it — but not a
  browse row: its root is a plain function component, so it takes no `ref`, which a row needs for
  roving focus. Browse rows are a plain `div` styled from `treeListRowVariants`, see
  `docs/browse-framework.md` § 3.3.
- **`TreeList` / `VirtualizedTreeList` are for trees.** Content Studio's content tree is the model for
  row geometry, hover, selected state and keyboard navigation, and `treeListRowVariants` in
  `../npm-enonic-ui/src/components/tree-list/tree-list.tsx` is where those classes are written down —
  copy the styles, do not adopt the component for a flat list.
- **A `Selector` inside a dialog needs `shared/ui/SelectorPopup`**, never a bare `Selector.Content`.
  `Selector.Content` registers its portalled element with the enclosing dialog so that picking an option
  does not read as a click outside the dialog — but it registers once and renders `null` while closed
  instead of unmounting, so from the **second** open onward the dialog knows only the first popup element
  and closes on the pick. `SelectorPopup` carries the `data-click-outside-ignore` that settles it, and the
  reasoning is written down there. `Combobox` is unaffected — its portal unmounts the popup — which is why
  `PrincipalPicker` never showed this.
- **`Separator label="…"`** already applies `text-subtle uppercase tracking-wider` to the label — do
  not restate those, and keep the phrase sentence-case in `phrases.properties`.
- **`Avatar.Fallback`** renders only while `imageLoadingStatus` is `idle` or `error`; with no
  `Avatar.Image` the root starts `idle`, so a fallback-only avatar works.
- **`Toolbar`** is `Root` / `Container` / `Item` / `Separator` plus `ToggleGroup` / `ToggleItem`;
  `Container` requires `aria-label`, and `Item` wraps a focusable child with `asChild`. Roving
  tabindex and arrow-key navigation come from `Container` — do not reimplement them.
- **`Toast` sorts its children by identity.** Only a `Toast.Button` reaches the action column;
  everything else lands in the content column, so `Toast.Close` composed by hand renders in the
  wrong place and `withClose` is the only way to the close button — along with its hardcoded English
  `aria-label`. `Toast.Icon` renders `null` and reaches the root through context, so it has to be a
  child rather than a prop, and it is what decides the root's `role`. `widgets/notifications/`
  is the worked example.
- `SplitView` does **not** exist in `@enonic/ui` at all: the `split-view/` folder in the library
  checkout is empty and no commit in its history ever added one. Two-column layouts are flexbox.

## Selected rows

`selected` on `ListItem` sets `bg-surface-selected text-alt` and `data-tone=inverse`, so any nested
text — meta cells, badges — needs `group-data-[tone=inverse]:text-alt` to stay readable on the dark
active row.

## Tailwind

- v4, configured in `assets/css/index.css`; no `tailwind.config.js`. Design tokens come from
  `@enonic/ui/preset.css`, imported there.
- Use the semantic tokens (`bg-surface-primary`, `text-subtle`, `border-bdr-soft`, `text-alt`), not
  raw palette values like `bg-gray-100`.
- Class order is enforced by oxfmt (`sortTailwindcss`) — let `pnpm check:fix` sort it.
- No inline `style` for anything a token or utility can express.
- Both light and dark themes must work; the theme comes from the host (`host.theme`), applied
  inside the section's shadow root.
