import PropertyTree = api.data.PropertyTree;
import Option = api.ui.selector.Option;
import FormView = api.form.FormView;
import Application = api.application.Application;
import ApplicationKey = api.application.ApplicationKey;
import ApplicationConfig = api.application.ApplicationConfig;
import ApplicationConfiguratorDialog = api.form.inputtype.appconfig.ApplicationConfiguratorDialog;
import FormContext = api.form.FormContext;
import {AuthApplicationComboBox} from './AuthApplicationComboBox';

export class AuthApplicationSelectedOptionView
    extends api.ui.selector.combobox.BaseSelectedOptionView<Application> {

    private application: Application;

    private formView: FormView;

    private applicationConfig: ApplicationConfig;

    private applicationConfigFormDisplayedListeners: { (applicationKey: ApplicationKey): void }[] = [];

    private formContext: FormContext;

    private formValidityChangedHandler: { (event: api.form.FormValidityChangedEvent): void };

    private readOnly: boolean;

    constructor(option: Option<Application>,
                applicationConfig: ApplicationConfig,
                formContext: FormContext,
                readOnly: boolean = false) {

        super(option);

        this.readOnly = readOnly;

        if (this.readOnly) {
            this.setEditable(false);
            this.setRemovable(false);
        }

        this.application = option.displayValue;
        this.applicationConfig = applicationConfig;
        this.formContext = formContext;
    }

    doRender(): wemQ.Promise<boolean> {

        let header = new api.dom.DivEl('header');

        let namesAndIconView = new api.app.NamesAndIconView(new api.app.NamesAndIconViewBuilder().setSize(
            api.app.NamesAndIconViewSize.small)).setMainName(this.application.getDisplayName()).setSubName(
            this.application.getName() + '-' + this.application.getVersion()).setIconClass('icon-xlarge icon-puzzle');

        if (this.application.getIconUrl()) {
            namesAndIconView.setIconUrl(this.application.getIconUrl());
        }

        if (this.application.getDescription()) {
            namesAndIconView.setSubName(this.application.getDescription());
        }

        header.appendChild(namesAndIconView);

        this.appendChild(header);
        if (this.application.getIdProviderForm().getFormItems().length === 0) {
            this.setEditable(false);
        }

        if (!this.readOnly) {
            this.appendActionButtons(header);
        }

        this.formValidityChangedHandler = (event: api.form.FormValidityChangedEvent) => {
            this.toggleClass('invalid', !event.isValid());
        };

        this.formView = this.createFormView(this.applicationConfig);
        this.formView.layout();

        return wemQ(true);
    }

    setSiteConfig(applicationConfig: ApplicationConfig) {
        this.applicationConfig = applicationConfig;
    }

    protected onEditButtonClicked(e: MouseEvent) {
        this.initAndOpenConfigureDialog();

        return super.onEditButtonClicked(e);
    }

    initAndOpenConfigureDialog(comboBoxToUndoSelectionOnCancel?: AuthApplicationComboBox) {

        if (this.application.getIdProviderForm().getFormItems().length === 0) {
            return;
        }

        let tempSiteConfig: ApplicationConfig = this.makeTemporarySiteConfig();

        let formViewStateOnDialogOpen = this.formView;
        this.unbindValidationEvent(formViewStateOnDialogOpen);

        this.formView = this.createFormView(tempSiteConfig);
        this.bindValidationEvent(this.formView);

        let okCallback = () => {
            if (!tempSiteConfig.equals(this.applicationConfig)) {
                this.applyTemporaryConfig(tempSiteConfig);
            }
        };

        let cancelCallback = () => {
            this.revertFormViewToGivenState(formViewStateOnDialogOpen);
            if (comboBoxToUndoSelectionOnCancel) {
                this.undoSelectionOnCancel(comboBoxToUndoSelectionOnCancel);
            }
        };

        let applicationConfiguratorDialog = new ApplicationConfiguratorDialog(this.application,
            this.formView,
            okCallback,
            cancelCallback);

        applicationConfiguratorDialog.open();
    }

    private revertFormViewToGivenState(formViewStateToRevertTo: FormView) {
        this.unbindValidationEvent(this.formView);
        this.formView = formViewStateToRevertTo;
        this.formView.validate(false, true);
        this.toggleClass('invalid', !this.formView.isValid());
    }

    private undoSelectionOnCancel(comboBoxToUndoSelectionOnCancel: AuthApplicationComboBox) {
        comboBoxToUndoSelectionOnCancel.deselect(this.application);
    }

    private applyTemporaryConfig(tempSiteConfig: ApplicationConfig) {
        tempSiteConfig.getConfig().forEach((property) => {
            this.applicationConfig.getConfig().setProperty(property.getName(), property.getIndex(), property.getValue());
        });
        this.applicationConfig.getConfig().forEach((property) => {
            let prop = tempSiteConfig.getConfig().getProperty(property.getName(), property.getIndex());
            if (!prop) {
                this.applicationConfig.getConfig().removeProperty(property.getName(), property.getIndex());
            }
        });
    }

    private makeTemporarySiteConfig(): ApplicationConfig {
        let propSet = (new PropertyTree(this.applicationConfig.getConfig())).getRoot();
        propSet.setContainerProperty(this.applicationConfig.getConfig().getProperty());
        return ApplicationConfig.create().setConfig(propSet).setApplicationKey(this.applicationConfig.getApplicationKey()).build();
    }

    private createFormView(applicationConfig: ApplicationConfig): FormView {
        let formView = new FormView(this.formContext, this.application.getIdProviderForm(), applicationConfig.getConfig());
        formView.addClass('site-form');

        formView.onLayoutFinished(() => {
            formView.validate(false, true);
            this.toggleClass('invalid', !formView.isValid());
            this.notifyApplicationConfigFormDisplayed(this.application.getApplicationKey());
        });

        return formView;
    }

    private bindValidationEvent(formView: FormView) {
        if (formView) {
            formView.onValidityChanged(this.formValidityChangedHandler);
        }
    }

    private unbindValidationEvent(formView: FormView) {
        if (formView) {
            formView.unValidityChanged(this.formValidityChangedHandler);
        }
    }

    getApplication(): Application {
        return this.application;
    }

    getSiteConfig(): ApplicationConfig {
        return this.applicationConfig;
    }

    getFormView(): FormView {
        return this.formView;
    }

    onApplicationConfigFormDisplayed(listener: { (applicationKey: ApplicationKey): void; }) {
        this.applicationConfigFormDisplayedListeners.push(listener);
    }

    unApplicationConfigFormDisplayed(listener: { (applicationKey: ApplicationKey): void; }) {
        this.applicationConfigFormDisplayedListeners =
            this.applicationConfigFormDisplayedListeners.filter((curr) => (curr !== listener));
    }

    private notifyApplicationConfigFormDisplayed(applicationKey: ApplicationKey) {
        this.applicationConfigFormDisplayedListeners.forEach((listener) => listener(applicationKey));
    }
}
