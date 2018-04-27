import {SaveUserStoreRequest} from './SaveUserStoreRequest';

export class CreateUserStoreRequest
    extends SaveUserStoreRequest {

    constructor() {
        super('createUserStore');
    }
}
