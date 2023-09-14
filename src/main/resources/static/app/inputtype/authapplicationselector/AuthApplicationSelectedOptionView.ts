import Q from 'q';
import {PropertyTree} from '@enonic/lib-admin-ui/data/PropertyTree';
import {Option} from '@enonic/lib-admin-ui/ui/selector/Option';
import {FormView} from '@enonic/lib-admin-ui/form/FormView';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import {ApplicationConfig} from '@enonic/lib-admin-ui/application/ApplicationConfig';
import {ApplicationConfiguratorDialog} from '@enonic/lib-admin-ui/form/inputtype/appconfig/ApplicationConfiguratorDialog';
import {FormContext} from '@enonic/lib-admin-ui/form/FormContext';
import {AuthApplicationComboBox} from './AuthApplicationComboBox';
import {BaseSelectedOptionView} from '@enonic/lib-admin-ui/ui/selector/combobox/BaseSelectedOptionView';
import {FormValidityChangedEvent} from '@enonic/lib-admin-ui/form/FormValidityChangedEvent';
import {NamesAndIconView, NamesAndIconViewBuilder} from '@enonic/lib-admin-ui/app/NamesAndIconView';
import {NamesAndIconViewSize} from '@enonic/lib-admin-ui/app/NamesAndIconViewSize';
import {FormState} from '@enonic/lib-admin-ui/app/wizard/WizardPanel';
import {BaseSelectedOptionViewBuilder} from '@enonic/lib-admin-ui/ui/selector/combobox/BaseSelectedOptionView';

export class AuthApplicationSelectedOptionView
    extends BaseSelectedOptionView<Application> {

    private readonly application: Application;

    private formView: FormView;

    private applicationConfig: ApplicationConfig;

    private applicationConfigFormDisplayedListeners: ((applicationKey: ApplicationKey) => void)[] = [];

    private formValidityChangedHandler: (event: FormValidityChangedEvent) => void;

    constructor(option: Option<Application>,
                applicationConfig: ApplicationConfig,
                readOnly: boolean = false) {

        super(new BaseSelectedOptionViewBuilder<Application>().setOption(option));

        this.application = option.getDisplayValue();
        this.applicationConfig = applicationConfig;

        this.setReadonly(readOnly);

        if (readOnly) {
            this.setEditable(false);
            this.setRemovable(false);
        } else {
            this.setEditable(this.application.getIdProviderForm()?.getFormItems().length > 0);
        }
    }

    doRender(): Q.Promise<boolean> {

        const namesAndIconView = new NamesAndIconView(new NamesAndIconViewBuilder()
            .setSize(NamesAndIconViewSize.small))
            .setMainName(this.application.getDisplayName())
            .setSubName(this.application.getName() + '-' + this.application.getVersion())
            .setIconClass('icon-xlarge icon-puzzle');

        if (this.application.getIconUrl()) {
            namesAndIconView.setIconUrl(this.application.getIconUrl());
        }

        if (this.application.getDescription()) {
            namesAndIconView.setSubName(this.application.getDescription());
        }

        this.appendChild(namesAndIconView);

        if (this.isEditable() || this.isRemovable()) {
            this.appendActionButtons();
        }

        this.formValidityChangedHandler = (event: FormValidityChangedEvent) => {
            this.toggleClass('invalid', !event.isValid());
        };

        this.formView = this.createFormView(this.applicationConfig);
        this.formView.layout();

        return Q(true);
    }

    setSiteConfig(applicationConfig: ApplicationConfig): void {
        this.applicationConfig = applicationConfig;
    }

    protected onEditButtonClicked(e: MouseEvent): boolean {
        this.initAndOpenConfigureDialog();

        return super.onEditButtonClicked(e);
    }

    initAndOpenConfigureDialog(comboBoxToUndoSelectionOnCancel?: AuthApplicationComboBox): void {

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

        const applicationConfiguratorDialog = new ApplicationConfiguratorDialog({
            application: this.application,
            formView: this.formView,
            okCallback,
            cancelCallback
        });

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
        const context: FormContext = FormContext.create().setFormState(new FormState(false)).build();
        const formView = new FormView(context, this.application.getIdProviderForm(), applicationConfig.getConfig());
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

    onApplicationConfigFormDisplayed(listener: (applicationKey: ApplicationKey) => void): void {
        this.applicationConfigFormDisplayedListeners.push(listener);
    }

    unApplicationConfigFormDisplayed(listener: (applicationKey: ApplicationKey) => void): void {
        this.applicationConfigFormDisplayedListeners =
            this.applicationConfigFormDisplayedListeners.filter((curr) => (curr !== listener));
    }

    private notifyApplicationConfigFormDisplayed(applicationKey: ApplicationKey) {
        this.applicationConfigFormDisplayedListeners.forEach((listener) => listener(applicationKey));
    }
}
