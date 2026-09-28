import {
  createInputTypeRegistry,
  PrincipalSelectorDescriptor,
  registerBuiltInTypes,
  type InputTypeRegistry,
} from '@enonic/input-types';

import { PrincipalSelectorInput } from '../../../entities/principal/ui/PrincipalSelectorInput';

/** The input types an id provider's configuration renders with. Its own registry, so the shared one stays the package's. */
export const CONFIG_INPUT_TYPES: InputTypeRegistry = createInputTypeRegistry();

registerBuiltInTypes(CONFIG_INPUT_TYPES);

// The package ships the descriptor alone: where principals come from is this application's to say.
CONFIG_INPUT_TYPES.registerType(
  { mode: 'internal', descriptor: PrincipalSelectorDescriptor, component: PrincipalSelectorInput },
  true,
);
