import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

export class CryptoWorker {

    static cryptoWorker: Worker;

    static getCryptoWorker(): Worker {
        if (!CryptoWorker.cryptoWorker) {
            CryptoWorker.cryptoWorker = new Worker(CONFIG.getString('cryptoWorkerUrl'));
        }
        return CryptoWorker.cryptoWorker;
    }

}
