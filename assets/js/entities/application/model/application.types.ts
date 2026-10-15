/** An application that ships an id provider descriptor, so a provider can be bound to it. */
export type IdProviderApplication = {
  key: string;
  displayName: string;
  /** Whether the descriptor declares a config form, which `fetchIdProviderForm` reads. */
  hasConfig: boolean;
  /** The application's icon as a `data:` uri; absent when it ships none. */
  icon?: string;
};
