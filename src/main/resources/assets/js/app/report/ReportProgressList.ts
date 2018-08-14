import ListBox = api.ui.selector.list.ListBox;
import i18n = api.util.i18n;
import PrincipalKey = api.security.PrincipalKey;
import UserStoreKey = api.security.UserStoreKey;
import {Report} from './Report';
import {ReportWebSocket} from './ReportWebSocket';
import {ListReportsRequest} from '../../api/graphql/report/ListReportsRequest';

export class ReportProgressList
    extends ListBox<Report> {

    constructor(principalKey: PrincipalKey, repositoryIds?: string[]) {
        super('report-progress-list');
        const socket = ReportWebSocket.getInstance();

        this.loadExistingReports(principalKey, repositoryIds);

        socket.onReportProgress((report: Report, progress: number) => {
            let view = <ReportProgressItem> this.getItemView(report);
            if (!view) {
                this.addItem(report);   // report has not yet been added but the progress has already started
                view = <ReportProgressItem> this.getItemView(report);
            }

            if (progress < 100) {
                view.setProgress(progress);
            } else {
                view.setReportReady(true);
            }
        });
    }

    protected createItemView(item: Report, readOnly: boolean): ReportProgressItem {
        return new ReportProgressItem(item);
    }

    protected getItemId(item: Report): string {
        return item.getId();
    }

    private loadExistingReports(principalKey: PrincipalKey, repositoryIds?: string[]) {
        new ListReportsRequest()
            .setPrincipalKey(principalKey)
            .setRepositoryIds(repositoryIds)
            .sendAndParse()
            .then(reports => this.addItems(reports));
    }
}

class ReportProgressItem
    extends api.dom.LiEl {
    private readonly progress: api.ui.ProgressBar;
    private readonly downloadLink: api.dom.AEl;

    constructor(item: Report) {
        super('report-progress-item');
        const name = new api.dom.SpanEl('title');
        name.setHtml(item.getRepositoryId());

        this.setReportReady(item.getTaskId() === undefined);

        this.progress = new api.ui.ProgressBar(Math.random() * 100);
        this.downloadLink = new api.dom.AEl('download').setUrl(item.getUrl(), '_blank');
        this.downloadLink.getEl().setText(i18n('action.report.download')).setAttribute('download',
            `Report_${item.getPrincipalKey().getId()}_in_ ${item.getRepositoryId()}.csv`);

        this.appendChildren(name, this.progress, this.downloadLink);
    }

    public setProgress(value: number) {
        this.progress.setValue(value);
    }

    public setReportReady(value: boolean) {
        this.toggleClass('ready', value);
    }
}

