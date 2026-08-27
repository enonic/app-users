/** An application that ships an id provider descriptor, so a provider can be bound to it. */
export type IdProviderApplication = {
  key: string;
  displayName: string;
  /** Whether the descriptor declares a config form. Rendering it is app-settings#64. */
  hasConfig: boolean;
};
