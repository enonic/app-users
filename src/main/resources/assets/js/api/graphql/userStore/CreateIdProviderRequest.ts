import {SaveIdProviderRequest} from './SaveIdProviderRequest';

export class CreateIdProviderRequest
    extends SaveIdProviderRequest {

    constructor() {
        super('createIdProvider');
    }
}
