import {Application} from 'lib-admin-ui/application/Application';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {ApplicationViewer} from 'lib-admin-ui/application/ApplicationViewer';
import {FormView} from 'lib-admin-ui/form/FormView';
import {SelectedOption} from 'lib-admin-ui/ui/selector/combobox/SelectedOption';
import {AuthApplicationSelectedOptionsView} from './AuthApplicationSelectedOptionsView';
import {AuthApplicationSelectedOptionView} from './AuthApplicationSelectedOptionView';
import {RichComboBox, RichComboBoxBuilder} from 'lib-admin-ui/ui/selector/combobox/RichComboBox';
import {BaseLoader} from 'lib-admin-ui/util/loader/BaseLoader';
import {Viewer} from 'lib-admin-ui/ui/Viewer';
import {AuthApplicationLoader} from './AuthApplicationLoader';

export class AuthApplicationComboBox
    extends RichComboBox<Application> {

    private authApplicationSelectedOptionsView: AuthApplicationSelectedOptionsView;

    constructor(builder: AuthApplicationComboBoxBuilder) {
        super(builder);

        this.authApplicationSelectedOptionsView = builder.selectedOptionsView;
    }

    public static create(): AuthApplicationComboBoxBuilder {
        return new AuthApplicationComboBoxBuilder();
    }

    getSelectedOptionViews(): AuthApplicationSelectedOptionView[] {
        let views: AuthApplicationSelectedOptionView[] = [];
        this.getSelectedOptions().forEach((selectedOption: SelectedOption<Application>) => {
            views.push(<AuthApplicationSelectedOptionView>selectedOption.getOptionView());
        });
        return views;
    }

    onSiteConfigFormDisplayed(listener: { (applicationKey: ApplicationKey, formView: FormView) }): void {
        this.authApplicationSelectedOptionsView.onApplicationConfigFormDisplayed(listener);
    }

    unSiteConfigFormDisplayed(listener: { (applicationKey: ApplicationKey, formView: FormView) }): void {
        this.authApplicationSelectedOptionsView.unApplicationConfigFormDisplayed(listener);
    }

    onBeforeOptionCreated(listener: () => void): void {
        this.authApplicationSelectedOptionsView.onBeforeOptionCreated(listener);
    }

    unBeforeOptionCreated(listener: () => void): void {
        this.authApplicationSelectedOptionsView.unBeforeOptionCreated(listener);
    }

    onAfterOptionCreated(listener: () => void): void {
        this.authApplicationSelectedOptionsView.onAfterOptionCreated(listener);
    }

    unAfterOptionCreated(listener: () => void): void {
        this.authApplicationSelectedOptionsView.unAfterOptionCreated(listener);
    }
}

export class AuthApplicationComboBoxBuilder extends RichComboBoxBuilder<Application> {

    identifierMethod: string = 'getApplicationKey';

    comboBoxName: string = 'applicationSelector';

    delayedInputValueChangedHandling: number = 500;

    loader: BaseLoader<Application> = new AuthApplicationLoader();

    optionDisplayValueViewer: Viewer<Application> = new ApplicationViewer();

    maximumOccurrences: number = 1;

    selectedOptionsView: AuthApplicationSelectedOptionsView;

    build(): AuthApplicationComboBox {
        return new AuthApplicationComboBox(this);
    }
}
