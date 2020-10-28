import * as Q from 'q';
import {PropertyTree} from 'lib-admin-ui/data/PropertyTree';
import {Option} from 'lib-admin-ui/ui/selector/Option';
import {FormView} from 'lib-admin-ui/form/FormView';
import {Application} from 'lib-admin-ui/application/Application';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {ApplicationConfig} from 'lib-admin-ui/application/ApplicationConfig';
import {ApplicationConfiguratorDialog} from 'lib-admin-ui/form/inputtype/appconfig/ApplicationConfiguratorDialog';
import {FormContext} from 'lib-admin-ui/form/FormContext';
import {AuthApplicationComboBox} from './AuthApplicationComboBox';
import {BaseSelectedOptionView} from 'lib-admin-ui/ui/selector/combobox/BaseSelectedOptionView';
import {FormValidityChangedEvent} from 'lib-admin-ui/form/FormValidityChangedEvent';
import {NamesAndIconView, NamesAndIconViewBuilder} from 'lib-admin-ui/app/NamesAndIconView';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {NamesAndIconViewSize} from 'lib-admin-ui/app/NamesAndIconViewSize';

export class AuthApplicationSelectedOptionView
    extends BaseSelectedOptionView<Application> {

    private application: Application;

    private formView: FormView;

    private applicationConfig: ApplicationConfig;

    private applicationConfigFormDisplayedListeners: { (applicationKey: ApplicationKey): void }[] = [];

    private formContext: FormContext;

    private formValidityChangedHandler: { (event: FormValidityChangedEvent): void };

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

        this.application = option.getDisplayValue();
        this.applicationConfig = applicationConfig;
        this.formContext = formContext;
    }

    doRender(): Q.Promise<boolean> {

        let header = new DivEl('header');

        let namesAndIconView = new NamesAndIconView(new NamesAndIconViewBuilder().setSize(
            NamesAndIconViewSize.small)).setMainName(this.application.getDisplayName()).setSubName(
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

        this.formValidityChangedHandler = (event: FormValidityChangedEvent) => {
            this.toggleClass('invalid', !event.isValid());
        };

        this.formView = this.createFormView(this.applicationConfig);
        this.formView.layout();

        return Q(true);
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
        this.applicationConfig.getConfig().removeEmptySets();
    }

    private makeTemporarySiteConfig(): ApplicationConfig {
        const propertyTree = new PropertyTree(this.applicationConfig.getConfig());
        const propertySet = propertyTree.getRoot();
        propertySet.setContainerProperty(this.applicationConfig.getConfig().getProperty());
        return ApplicationConfig.create().setConfig(propertySet).setApplicationKey(this.applicationConfig.getApplicationKey()).build();
    }

    private createFormView(applicationConfig: ApplicationConfig): FormView {
        const formView = new FormView(this.formContext, this.application.getIdProviderForm(), applicationConfig.getConfig());
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
