import {SaveIdProviderRequest} from './SaveIdProviderRequest';

export class UpdateIdProviderRequest
    extends SaveIdProviderRequest {

    constructor() {
        super('updateUserStore');
    }
}
