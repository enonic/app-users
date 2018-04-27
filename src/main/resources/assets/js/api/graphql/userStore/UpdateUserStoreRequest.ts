import {SaveUserStoreRequest} from './SaveUserStoreRequest';

export class UpdateUserStoreRequest
    extends SaveUserStoreRequest {

    constructor() {
        super('updateUserStore');
    }
}
