interface Data {
	cryptoWorkerUrl: string
}


export class CryptoWorker {

    static cryptoWorker: Worker;

    static getCryptoWorker(): Worker {
        if (!CryptoWorker.cryptoWorker) {
            const inlineJsonElement = document.querySelector("script[data-app='com.enonic.xp.app.users']");
            const json = inlineJsonElement.textContent;
            let data = {} as Data;
            try {
                data = JSON.parse(json as string);
            } catch (e) {
                console.error('Something went wrong while trying to JSON.parse(' + json + ')');
            }
            CryptoWorker.cryptoWorker = new Worker(data.cryptoWorkerUrl);
        }
        return CryptoWorker.cryptoWorker;
    }

}
