import ListBox = api.ui.selector.list.ListBox;
import i18n = api.util.i18n;
import PrincipalKey = api.security.PrincipalKey;
import DateHelper = api.util.DateHelper;
import TaskEvent = api.task.TaskEvent;
import TaskEventType = api.task.TaskEventType;
import DivEl = api.dom.DivEl;
import {Report} from './Report';
import {ListReportsRequest} from '../../api/graphql/report/ListReportsRequest';
import {DeleteReportsRequest} from '../../api/graphql/report/DeleteReportsRequest';
import {GetReportRequest} from '../../api/graphql/report/GetReportRequest';

export class ReportProgressList
    extends ListBox<Report> {

    constructor(principalKey: PrincipalKey, repositoryIds?: string[]) {
        super('report-progress-list');

        this.loadExistingReports(principalKey, repositoryIds);
        this.handlePermReportsTaskEvents();
    }

    private handlePermReportsTaskEvents() {
        const handler = this.handleTaskEvent.bind(this);

        TaskEvent.on(handler);

        this.onRemoved(() => {
            TaskEvent.un(handler);
        });
    }

    private handleTaskEvent(event: TaskEvent) {
        if (event.getTaskInfo().getDescription().indexOf('Report task') < 0) {
            return;
        }

        const view: ReportProgressItem = this.getItemViewByTaskEvent(event);

        if (!view) {
            return;
        }

        if (event.getEventType() === TaskEventType.UPDATED) {
            const taskProgress: api.task.TaskProgress = event.getTaskInfo().getProgress();
            const progress: number = taskProgress.getCurrent() * 100 / taskProgress.getTotal();
            view.setProgress(progress);

            return;
        }

        if (event.getEventType() === TaskEventType.FINISHED) {
            view.setReportReady(true);

            new GetReportRequest(view.getItem().getId()).sendAndParse().then((report: Report) => {
                view.setFinished(report.getFinished());
            });

            api.notify.NotifyManager.get().showSuccess(i18n('notify.report.finished', view.getItem().getPrincipalDisplayName()));

            return;
        }
    }

    private getItemViewByTaskEvent(event: TaskEvent): ReportProgressItem {
        const eventTaskId: string = event.getTaskInfo().getId().toString();
        const items = this.getItems().filter((item: Report) => item.getTaskId() === eventTaskId);

        if (items.length === 0) {
            return null;
        }

        return <ReportProgressItem>this.getItemView(items[0]);
    }

    protected createItemView(item: Report, readOnly: boolean): ReportProgressItem {
        const view = new ReportProgressItem(item);
        view.onDeleteClicked(report => this.deleteReport(report));
        return view;
    }

    protected getItemId(item: Report): string {
        return item.getId();
    }

    private deleteReport(report: Report): wemQ.Promise<boolean> {
        return new DeleteReportsRequest([report.getId()]).sendAndParse().then(count => {
            if (count === 1) {
                this.removeItem(report);
            }
            return count === 1;
        });
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

    private timestamp: api.dom.Element;
    private progress: api.ui.ProgressBar;
    private deleteClickListeners: { (item: Report): void }[] = [];
    private item: Report;

    constructor(item: Report) {
        super('report-progress-item');
        this.item = item;

        this.addElements();
        this.setReportReady(item.getTaskId() === undefined);
        this.setFinished(item.getFinished());
    }

    private addElements() {
        this.progress = new api.ui.ProgressBar();
        this.timestamp = new api.dom.SpanEl('timestamp');

        const name = new api.dom.SpanEl('title');
        name.setHtml(`${this.item.getRepositoryId()} (${this.item.getReportBranch()})`);

        const downloadLink = new api.dom.AEl('icon-report-download').setUrl(this.item.getUrl(), '_blank').addClass('icon-download');
        downloadLink.appendChild(new api.dom.SpanEl().setHtml(i18n('action.report.download'))).getEl().setAttribute('download',
            `Report_${this.item.getPrincipalDisplayName()}_in_${this.item.getRepositoryId()}.csv`);
        downloadLink.onClicked(event => this.notifyDeleteClicked(this.item));

        const deleteLink = new api.dom.AEl('icon-report-delete').addClass('icon-close');
        deleteLink.appendChild(new api.dom.SpanEl().setHtml(i18n('action.delete'))).onClicked(event => this.notifyDeleteClicked(this.item));

        const reportdata: DivEl = new DivEl('reportdata');
        reportdata.appendChildren(name, this.progress, this.timestamp);

        const buttons: DivEl = new DivEl('buttons');
        buttons.appendChildren(downloadLink, deleteLink);

        this.appendChildren(reportdata, buttons);
    }

    public getItem(): Report {
        return this.item;
    }

    public setProgress(value: number) {
        this.progress.setValue(value);
    }

    public setFinished(date: Date) {
        this.timestamp.setHtml(!!date ? `${DateHelper.formatDate(date)} ${DateHelper.formatTime(date.getHours(), date.getMinutes())}` : '');
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

