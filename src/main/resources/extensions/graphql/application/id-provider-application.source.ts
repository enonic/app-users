import { encodeApplicationIcon } from '/lib/icon';
import { getIdProviderDescriptor, getIdProviderForm } from '/lib/idprovider';
import { getDescriptor, list, type Application, type ApplicationDescriptor } from '/lib/xp/app';
import type { FormJson } from '@enonic/ui-types';

export type IdProviderApplicationSource = {
  key: string;
  displayName: string;
  hasConfig: boolean;
  /** The descriptor's icon as a `data:` uri, absent when the application ships none. */
  icon?: string;
};

/**
 * ! One descriptor read per installed application. Cheaper than it looks — the descriptor service
 * ! reads one resource per application and nothing walks the jar.
 */
export function listIdProviderApplications(): IdProviderApplicationSource[] {
  const providers: IdProviderApplicationSource[] = [];

  for (const application of list()) {
    const descriptor = getIdProviderDescriptor({ application: application.key });

    if (descriptor != null) {
      const applicationDescriptor = getDescriptor({ key: application.key });
      providers.push({
        key: application.key,
        displayName: displayNameOf(application, applicationDescriptor),
        hasConfig: descriptor.hasConfig,
        icon: iconDataUriOf(application.key, applicationDescriptor),
      });
    }
  }

  return providers.sort((a, b) =>
    a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }),
  );
}

/** Null when the application ships no id provider descriptor; empty when it declares no form. */
export function idProviderFormOf(application: string, locale?: string): FormJson | null {
  return getIdProviderForm({ application, locale });
}

//
// * Internal
//

// ! The mime type is read off the descriptor, the bytes through the bean: the `ByteSource` the descriptor
// ! carries cannot reach the client from GraalJS — see `/lib/icon`.
function iconDataUriOf(key: string, descriptor: ApplicationDescriptor | null): string | undefined {
  const mimeType = descriptor?.icon?.mimeType;
  if (mimeType == null) {
    return undefined;
  }

  const encoded = encodeApplicationIcon({ application: key });
  return encoded == null ? undefined : `data:${mimeType};base64,${encoded}`;
}

function displayNameOf(application: Application, descriptor: ApplicationDescriptor | null): string {
  const title = descriptor?.title;
  return title != null && title.length > 0 ? title : application.key;
}
