import {Report} from './Report';

declare var CONFIG;

export class ReportWebSocket {
    private ws: WebSocket;
    private static KEEP_ALIVE_TIME: number = 30 * 1000;
    private static INSTANCE: ReportWebSocket;
    private reconnectInterval: number;
    private keepConnected: boolean;
    private keepAliveIntervalId: number;
    private disconnectTimeoutHandle: number;
    private connected: boolean;
    private progressListeners: { (report: Report, progress: number): void }[] = [];
    private downloadListeners: { (report: Report): void }[] = [];

    constructor(reconnectIntervalSeconds: number = 5) {
        this.ws = null;
        this.reconnectInterval = reconnectIntervalSeconds * 1000;
    }

    public static getInstance(): ReportWebSocket {
        if (!ReportWebSocket.INSTANCE) {
            ReportWebSocket.INSTANCE = new ReportWebSocket();
        }

        return ReportWebSocket.INSTANCE;
    }

    public connect() {
        if (!WebSocket) {
            console.warn('ReportWebSocket: WebSockets not supported.');
            return;
        }
        const wsUrl = api.util.UriHelper.joinPath(this.getWebSocketUriPrefix(), CONFIG['reportServiceUrl']);
        this.keepConnected = true;
        this.doConnect(wsUrl);
    }

    private doConnect(wsUrl: string) {
        this.ws = new WebSocket(wsUrl, 'permission-reports');

        this.ws.addEventListener('close', () => {
            clearInterval(this.keepAliveIntervalId);

            this.disconnectTimeoutHandle = setTimeout(() => {
                if (this.connected) {
                    if (this.keepConnected) {
                        //this.notifyConnectionLost();
                    }
                    this.connected = !this.connected;
                }
            }, this.reconnectInterval + 1000);

            // attempt to reconnect
            if (this.keepConnected) {
                setTimeout(() => {
                    if (this.keepConnected) {
                        this.doConnect(wsUrl);
                    }
                }, this.reconnectInterval);
            }
        });

        this.ws.addEventListener('error', (ev: ErrorEvent) => {
            console.error('ReportWebSocket: Unable to connect to server web socket on ' + wsUrl, ev);
        });

        this.ws.addEventListener('message', (remoteEvent: any) => {
            let jsonEvent = <api.event.NodeEventJson> JSON.parse(remoteEvent.data);

            this.handleSocketEvent(jsonEvent);
        });

        this.ws.addEventListener('open', () => {
            clearTimeout(this.disconnectTimeoutHandle);
            this.keepAliveIntervalId = setInterval(() => {
                if (this.connected) {
                    this.ws.send('KeepAlive');
                }
            }, ReportWebSocket.KEEP_ALIVE_TIME);
            if (!this.connected) {
                //this.notifyConnectionRestored();
                this.connected = !this.connected;
            }
        });
    }

    public disconnect() {
        this.keepConnected = false;
        if (this.ws) {
            this.ws.close();
        }
    }

    public isConnected(): boolean {
        return this.ws.readyState === WebSocket.OPEN;
    }

    private getWebSocketUriPrefix(): string {
        let loc = window.location;
        let newUri;
        if (loc.protocol === 'https:') {
            newUri = 'wss:';
        } else {
            newUri = 'ws:';
        }
        newUri += '//' + loc.host;
        return newUri;
    }

    private handleSocketEvent(event: any) {
        // only progress currently
        switch (event.type) {
        case 'reportProgress':
            this.notifyReportProgress(Report.fromJson(event.report), event.progress);
            break;
        case 'reportDownload':
            this.notifyReportDownload(Report.fromJson(event.report));
            break;
        }
    }

    private notifyReportProgress(report: Report, progress: number) {
        this.progressListeners.forEach(l => l(report, progress));
    }

    public onReportProgress(listener: (report: Report, progress: number) => void) {
        this.progressListeners.push(listener);
    }

    public unReportProgress(listener: (report: Report, progress: number) => void) {
        this.progressListeners = this.progressListeners.filter(curr => curr !== listener);
    }

    private notifyReportDownload(report: Report) {
        this.downloadListeners.forEach(l => l(report));
    }

    public onReportDownload(listener: (report: Report) => void) {
        this.downloadListeners.push(listener);
    }

    public unReportDownload(listener: (report: Report) => void) {
        this.downloadListeners = this.downloadListeners.filter(curr => curr !== listener);
    }
}
