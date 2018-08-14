import ListBox = api.ui.selector.list.ListBox;
import i18n = api.util.i18n;
import PrincipalKey = api.security.PrincipalKey;
import {Report} from './Report';
import {ReportWebSocket} from './ReportWebSocket';
import {ListReportsRequest} from '../../api/graphql/report/ListReportsRequest';
import {DeleteReportsRequest} from '../../api/graphql/report/DeleteReportsRequest';

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
                view.setFinished(report.getFinished());
                view.setReportReady(true);
            }
        });
    }

    protected createItemView(item: Report, readOnly: boolean): ReportProgressItem {
        const view = new ReportProgressItem(item);
        view.onDeleteClicked(report => {
            new DeleteReportsRequest([report.getId()]).sendAndParse().then(count => {
                if (count === 1) {
                    this.removeItem(report);
                }
            });
        });
        return view;
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

    private readonly timestamp: api.dom.Element;
    private readonly progress: api.ui.ProgressBar;
    private deleteClickListeners: { (item: Report): void }[] = [];

    constructor(item: Report) {
        super('report-progress-item');
        const name = new api.dom.SpanEl('title');
        name.setHtml(item.getRepositoryId());

        this.setReportReady(item.getTaskId() === undefined);

        this.progress = new api.ui.ProgressBar();

        this.timestamp = new api.dom.SpanEl('timestamp');
        this.setFinished(item.getFinished());

        const downloadLink = new api.dom.AEl('download').setUrl(item.getUrl(), '_blank');
        downloadLink.getEl().setText(i18n('action.report.download')).setAttribute('download',
            `Report_${item.getPrincipalDisplayName()}_in_${item.getRepositoryId()}.csv`);

        const deleteLink = new api.dom.AEl('delete');
        deleteLink.setHtml(i18n('action.delete')).onClicked(event => this.notifyDeleteClicked(item));

        this.appendChildren(name, this.progress, this.timestamp, downloadLink, deleteLink);
    }

    public setProgress(value: number) {
        this.progress.setValue(value);
    }

    public setFinished(date: Date) {
        this.timestamp.setHtml(!!date ? date.toISOString() : '');
    }

    public setReportReady(value: boolean) {
        this.toggleClass('ready', value);
    }

    private notifyDeleteClicked(item: Report): any {
        this.deleteClickListeners.forEach(curr => curr(item));
    }

    onDeleteClicked(listener: (item: Report) => void) {
        this.deleteClickListeners.push(listener);
    }

    unDeleteClicked(listener: (item: Report) => void) {
        this.deleteClickListeners = this.deleteClickListeners.filter(curr => curr !== listener);
    }
}

