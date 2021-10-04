import {Repository} from './Repository';
import {Viewer} from 'lib-admin-ui/ui/Viewer';
import {NamesView} from 'lib-admin-ui/app/NamesView';

export class RepositoryViewer
    extends Viewer<Repository> {

    private namesView: NamesView;

    constructor(className?: string) {
        super('repository-viewer' + (!!className ? ' ' + className : ''));
        this.namesView = new NamesView();
        this.namesView.addClass('repository-viewer-names-view');
        this.appendChild(this.namesView);
    }

    setObject(report: Repository): void {
        this.namesView.setMainName(report.getName());

        super.setObject(report);
    }
}
