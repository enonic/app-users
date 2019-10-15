import {Application} from 'lib-admin-ui/application/Application';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {ApplicationViewer} from 'lib-admin-ui/application/ApplicationViewer';
import {FormView} from 'lib-admin-ui/form/FormView';
import {SelectedOption} from 'lib-admin-ui/ui/selector/combobox/SelectedOption';
import {ApplicationConfigProvider} from 'lib-admin-ui/form/inputtype/appconfig/ApplicationConfigProvider';
import {FormContext} from 'lib-admin-ui/form/FormContext';
import {AuthApplicationSelectedOptionsView} from './AuthApplicationSelectedOptionsView';
import {AuthApplicationSelectedOptionView} from './AuthApplicationSelectedOptionView';
import {RichComboBox, RichComboBoxBuilder} from 'lib-admin-ui/ui/selector/combobox/RichComboBox';
import {AuthApplicationLoader} from 'lib-admin-ui/security/auth/AuthApplicationLoader';

export class AuthApplicationComboBox
    extends RichComboBox<Application> {

    private authApplicationSelectedOptionsView: AuthApplicationSelectedOptionsView;

    constructor(maxOccurrences: number, applicationConfigProvider: ApplicationConfigProvider,
                formContext: FormContext, value: string, readOnly: boolean) {

        let builder = new RichComboBoxBuilder<Application>();
        // tslint:disable-next-line:max-line-length
        const view: AuthApplicationSelectedOptionsView = new AuthApplicationSelectedOptionsView(applicationConfigProvider, formContext,
            readOnly);
        builder.setMaximumOccurrences(maxOccurrences)
            .setIdentifierMethod('getApplicationKey')
            .setComboBoxName('applicationSelector')
            .setLoader(new AuthApplicationLoader())
            .setSelectedOptionsView(view)
            .setOptionDisplayValueViewer(new ApplicationViewer())
            .setValue(value)
            .setDelayedInputValueChangedHandling(500);

        super(builder);

        this.authApplicationSelectedOptionsView = view;
    }

    getSelectedOptionViews(): AuthApplicationSelectedOptionView[] {
        let views: AuthApplicationSelectedOptionView[] = [];
        this.getSelectedOptions().forEach((selectedOption: SelectedOption<Application>) => {
            views.push(<AuthApplicationSelectedOptionView>selectedOption.getOptionView());
        });
        return views;
    }

    onSiteConfigFormDisplayed(listener: { (applicationKey: ApplicationKey, formView: FormView): void; }) {
        this.authApplicationSelectedOptionsView.onApplicationConfigFormDisplayed(listener);
    }

    unSiteConfigFormDisplayed(listener: { (applicationKey: ApplicationKey, formView: FormView): void; }) {
        this.authApplicationSelectedOptionsView.unApplicationConfigFormDisplayed(listener);
    }

    onBeforeOptionCreated(listener: () => void) {
        this.authApplicationSelectedOptionsView.onBeforeOptionCreated(listener);
    }

    unBeforeOptionCreated(listener: () => void) {
        this.authApplicationSelectedOptionsView.unBeforeOptionCreated(listener);
    }

    onAfterOptionCreated(listener: () => void) {
        this.authApplicationSelectedOptionsView.onAfterOptionCreated(listener);
    }

    unAfterOptionCreated(listener: () => void) {
        this.authApplicationSelectedOptionsView.unAfterOptionCreated(listener);
    }
}
