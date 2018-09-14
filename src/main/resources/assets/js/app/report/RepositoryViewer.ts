import {Repository} from './Repository';

export class RepositoryViewer
    extends api.ui.Viewer<Repository> {

    private namesView: api.app.NamesView;

    constructor(className?: string) {
        super('repository-viewer' + (!!className ? ' ' + className : ''));
        this.namesView = new api.app.NamesView();
        this.namesView.addClass('repository-viewer-names-view');
        this.appendChild(this.namesView);
    }

    setObject(report: Repository) {
        this.namesView.setMainName(report.getName());

        return super.setObject(report);
    }

    getPreferredHeight(): number {
        return 40;
    }
}
