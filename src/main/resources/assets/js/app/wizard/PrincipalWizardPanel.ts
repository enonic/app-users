import {UserItemWizardPanel} from './UserItemWizardPanel';
import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';
import {Router} from '../Router';
import {PrincipalWizardDataLoader} from './PrincipalWizardDataLoader';
import {GraphQlRequest} from '../../api/graphql/GraphQlRequest';
import {PrincipalNamedEvent} from '../event/PrincipalNamedEvent';
import {UserItemUpdatedEvent} from '../event/UserItemUpdatedEvent';
import {IdProvider} from '../principal/IdProvider';
import Principal = api.security.Principal;
import PrincipalType = api.security.PrincipalType;
import ConfirmationDialog = api.ui.dialog.ConfirmationDialog;
import WizardStep = api.app.wizard.WizardStep;
import i18n = api.util.i18n;

export class PrincipalWizardPanel extends UserItemWizardPanel<Principal> {

    protected params: PrincipalWizardPanelParams;

    protected principalNamedListeners: {(event: PrincipalNamedEvent): void}[];

    public static debug: boolean = false;

    constructor(params: PrincipalWizardPanelParams) {
        super(params);

        this.addClass('principal-wizard-panel');
        this.principalNamedListeners = [];
    }

    protected getParams(): PrincipalWizardPanelParams {
        return this.params;
    }

    protected doLoadData(): Q.Promise<Principal> {
        if (PrincipalWizardPanel.debug) {
            console.debug('PrincipalWizardPanel.doLoadData');
        }
        if (!this.getPersistedItem()) {
            if (PrincipalWizardPanel.debug) {
                console.debug('PrincipalWizardPanel.doLoadData: loading data...');
            }
            // don't call super.doLoadData to prevent saving new entity
            return new PrincipalWizardDataLoader().loadData(this.getParams())
                .then((loader) => {
                    if (PrincipalWizardPanel.debug) {
                        console.debug('PrincipalWizardPanel.doLoadData: loaded data', loader);
                    }
                    if (loader.principal) {
                        this.formState.setIsNew(false);
                        this.setPersistedItem(loader.principal);
                    }
                    return loader.principal;
                });
        } else {
            let equitable = this.getPersistedItem();
            if (PrincipalWizardPanel.debug) {
                console.debug('PrincipalWizardPanel.doLoadData: data present, skipping load...', equitable);
            }
            return wemQ(equitable);
        }
    }

    protected getPersistedItemPath(): string {
        return this.getPersistedItem().getKey().toPath();
    }

    protected createFormIcon(): api.app.wizard.FormIcon {
        let formIcon = super.createFormIcon();
        switch (this.getParams().persistedType) {
            case PrincipalType.USER:
                formIcon.addClass('icon-user');
                break;
            case PrincipalType.GROUP:
                formIcon.addClass('icon-users');
                break;
            case PrincipalType.ROLE:
                formIcon.addClass('icon-masks');
                break;
        }
        return formIcon;
    }

    getUserItemType(): string {
        switch (this.getParams().persistedType) {
        case PrincipalType.USER:
            return i18n('field.user');
        case PrincipalType.GROUP:
            return i18n('field.group');
        case PrincipalType.ROLE:
            return i18n('field.role');
        default:
            return '';
        }
    }

    isParentOfSameType(): boolean {
        return this.getParams().parentOfSameType;
    }

    getIdProvider(): IdProvider {
        return this.getParams().idProvider;
    }

    createSteps(principal?: Principal): WizardStep[] {
        throw new Error('Must be implemented by inheritors');
    }

    doLayout(persistedPrincipal: Principal): wemQ.Promise<void> {

        return super.doLayout(persistedPrincipal).then(() => {

            let viewedPrincipal;
            if (this.isRendered()) {

                viewedPrincipal = this.assembleViewedItem();
                if (!viewedPrincipal.equals(persistedPrincipal)) {

                    console.warn(`Received Principal from server differs from what's viewed:`);
                    console.warn(' viewedPrincipal: ', viewedPrincipal);
                    console.warn(' persistedPrincipal: ', persistedPrincipal);

                    new ConfirmationDialog()
                        .setQuestion(i18n('dialog.principal.update'))
                        .setYesCallback(() => this.doLayoutPersistedItem(persistedPrincipal ? persistedPrincipal.clone() : null))
                        .setNoCallback(() => { /* empty */ })
                        .show();
                }

                return wemQ<void>(null);
            } else {
                return this.doLayoutPersistedItem(persistedPrincipal ? persistedPrincipal.clone() : null);
            }

        });
    }

    protected doLayoutPersistedItem(principal: Principal): Q.Promise<void> {
        if (principal) {
            this.getWizardHeader().setDisplayName(principal.getDisplayName());
        }

        return wemQ<void>(null);
    }

    postPersistNewItem(persistedPrincipal: Principal): wemQ.Promise<Principal> {
        Router.setHash('edit/' + persistedPrincipal.getKey());

        return wemQ(persistedPrincipal);
    }

    updatePersistedItem(): wemQ.Promise<Principal> {
        return this.produceUpdateRequest(this.assembleViewedItem()).sendAndParse().then((principal:Principal) => {
            if (!this.getPersistedItem().getDisplayName() && !!principal.getDisplayName()) {
                this.notifyPrincipalNamed(principal);
            }

            const principalTypeName = i18n(`field.${PrincipalType[principal.getType()].toLowerCase()}`);
            api.notify.showFeedback(i18n('notify.update.any', principalTypeName, principal.getDisplayName()));
            new UserItemUpdatedEvent(principal, this.getIdProvider()).fire();

            return principal;
        });
    }

    protected produceUpdateRequest(viewedPrincipal: Principal): GraphQlRequest<any, Principal> {
        throw new Error('Must be implemented by inheritors');
    }

    protected assembleViewedItem():Principal {
        throw new Error('Must be implemented by inheritors');
    }

    onPrincipalNamed(listener: (event: PrincipalNamedEvent)=>void) {
        this.principalNamedListeners.push(listener);
    }

    notifyPrincipalNamed(principal: Principal) {
        this.principalNamedListeners.forEach((listener: (event: PrincipalNamedEvent)=>void)=> {
            listener.call(this, new PrincipalNamedEvent(this, principal));
        });
    }

    protected updateHash() {
        if (this.getPersistedItem()) {
            Router.setHash('edit/' + this.getPersistedItem().getKey());
        } else {
            Router.setHash('new/' + PrincipalType[this.getParams().persistedType].toLowerCase());
        }
    }

    isPersistedEqualsViewed(): boolean {
        const viewedPrincipal = this.assembleViewedItem();
        return viewedPrincipal.equals(this.getPersistedItem());
    }

    isNewChanged(): boolean {
        return true;
    }
}
