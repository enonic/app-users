import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

export class CryptoWorker {

    static cryptoWorker: Worker;

    static getCryptoWorker(): Worker {
        if (!CryptoWorker.cryptoWorker) {
            const assetsUri: string = CONFIG.getString('assetsUri');
            CryptoWorker.cryptoWorker = new Worker(`${assetsUri}/js/crypto-worker.js`);
        }
        return CryptoWorker.cryptoWorker;
    }

}
