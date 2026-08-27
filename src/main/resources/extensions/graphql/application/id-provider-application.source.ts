import { getIdProviderDescriptor } from '/lib/idprovider';
import { getDescriptor, list, type Application, type ApplicationDescriptor } from '/lib/xp/app';

export type IdProviderApplicationSource = {
  key: string;
  displayName: string;
  hasConfig: boolean;
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
      providers.push({
        key: application.key,
        displayName: displayNameOf(application, getDescriptor({ key: application.key })),
        hasConfig: descriptor.hasConfig,
      });
    }
  }

  return providers.sort((a, b) =>
    a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }),
  );
}

//
// * Internal
//

function displayNameOf(application: Application, descriptor: ApplicationDescriptor | null): string {
  const title = descriptor?.title;
  return title != null && title.length > 0 ? title : application.key;
}
