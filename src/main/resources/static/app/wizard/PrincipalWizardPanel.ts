import Q from 'q';
import {UserItemWizardPanel} from './UserItemWizardPanel';
import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';
import {Router} from '../Router';
import {PrincipalWizardDataLoader} from './PrincipalWizardDataLoader';
import {GraphQlRequest} from '../../graphql/GraphQlRequest';
import {UserItemUpdatedEvent} from '../event/UserItemUpdatedEvent';
import {IdProvider} from '../principal/IdProvider';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {ConfirmationDialog} from '@enonic/lib-admin-ui/ui/dialog/ConfirmationDialog';
import {WizardStep} from '@enonic/lib-admin-ui/app/wizard/WizardStep';
import {FormIcon} from '@enonic/lib-admin-ui/app/wizard/FormIcon';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {showFeedback} from '@enonic/lib-admin-ui/notify/MessageBus';
import {UserItemDeletedEvent} from '../event/UserItemDeletedEvent';
import {DeleteUserItemResult} from '../../graphql/useritem/DeleteUserItemResult';
import {UserItemKey} from '@enonic/lib-admin-ui/security/UserItemKey';
import {DeletePrincipalRequest} from '../../graphql/principal/DeletePrincipalRequest';
import {DeleteUserItemRequest} from '../../graphql/useritem/DeleteUserItemRequest';

export class PrincipalWizardPanel extends UserItemWizardPanel<Principal> {

    protected params: PrincipalWizardPanelParams;

    public static debug: boolean = false;

    constructor(params: PrincipalWizardPanelParams) {
        super(params);

        this.addClass('principal-wizard-panel');
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
            return Q(equitable);
        }
    }

    protected getPersistedItemPath(): string {
        return this.getPersistedItem().getKey().toPath();
    }

    protected createFormIcon(): FormIcon {
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

    doLayout(persistedPrincipal: Principal): Q.Promise<void> {
        return super.doLayout(persistedPrincipal).then(() => {

            let viewedPrincipal;
            if (this.isRendered()) {

                viewedPrincipal = this.assembleViewedItem();
                if (!viewedPrincipal.equals(persistedPrincipal)) {

                    console.warn('Received Principal from server differs from what\'s viewed:');
                    console.warn(' viewedPrincipal: ', viewedPrincipal);
                    console.warn(' persistedPrincipal: ', persistedPrincipal);

                    new ConfirmationDialog()
                        .setQuestion(i18n('dialog.principal.update'))
                        .setYesCallback(() => {
                            void this.doLayoutPersistedItem(persistedPrincipal ? persistedPrincipal.clone() : null);
                        })
                        .setNoCallback(() => { /* empty */
                        })
                        .show();
                }

                return Q<void>(null);
            } else {
                return this.doLayoutPersistedItem(persistedPrincipal ? persistedPrincipal.clone() : null);
            }

        });
    }

    protected doLayoutPersistedItem(principal: Principal): Q.Promise<void> {
        if (principal) {
            this.getWizardHeader().setDisplayName(principal.getDisplayName());
            this.getWizardHeader().setName(this.getWizardNameValue());
        }

        return Q<void>(null);
    }

    postPersistNewItem(persistedPrincipal: Principal): Q.Promise<Principal> {
        Router.setHash('edit/' + persistedPrincipal.getKey());

        return Q(persistedPrincipal);
    }

    updatePersistedItem(): Q.Promise<Principal> {
        return this.produceUpdateRequest(this.assembleViewedItem()).sendAndParse().then((principal: Principal) => {
            if (!this.getPersistedItem().getDisplayName() && !!principal.getDisplayName()) {
                this.notifyUserItemNamed(principal);
            }

            const principalTypeName = i18n(`field.${PrincipalType[principal.getType()].toLowerCase()}`);
            showFeedback(i18n('notify.update.any', principalTypeName, principal.getDisplayName()));
            new UserItemUpdatedEvent(principal, this.getIdProvider()).fire();

            return principal;
        });
    }

    protected produceUpdateRequest(viewedPrincipal: Principal): GraphQlRequest<Principal> {
        throw new Error('Must be implemented by inheritors');
    }

    protected assembleViewedItem(): Principal {
        throw new Error('Must be implemented by inheritors');
    }

    protected assemblePersistedItem(): Principal {
        throw new Error('Must be implemented by inheritors');
    }

    protected handleServerUpdate(principal: Principal, idProvider: IdProvider): void {
        if (principal && this.getPersistedItem().getKey().equals(principal.getKey())) {
            this.setPersistedItem(principal);
            this.doLayoutPersistedItem(principal);
        }
    }

    protected updateHash(): void {
        if (this.getPersistedItem()) {
            Router.setHash('edit/' + this.getPersistedItem().getKey());
        } else {
            Router.setHash('new/' + PrincipalType[this.getParams().persistedType].toLowerCase());
        }
    }

    isPersistedEqualsViewed(): boolean {
        const persistedPrincipal: Principal = this.assemblePersistedItem();
        const viewedPrincipal: Principal = this.assembleViewedItem();

        return viewedPrincipal.equals(persistedPrincipal);
    }

    isNewChanged(): boolean {
        return true;
    }

    protected produceDeleteRequest(): DeleteUserItemRequest {
        return new DeletePrincipalRequest().setKeys([this.getPersistedItem().getKey()]);
    }

    protected handleSuccessfulDelete(results: DeleteUserItemResult[]): void {
        const keys: UserItemKey[] = results.filter(result => result.isDeleted()).map(result => result.getKey());
        const msg: string =
            i18n(`notify.delete.principal.${keys.length === 1 ? 'single' : 'multiple'}`, keys.join(', '));

        this.close();
        showFeedback(msg);
        UserItemDeletedEvent.create().setPrincipals([this.getPersistedItem()]).build().fire();
    }
}
