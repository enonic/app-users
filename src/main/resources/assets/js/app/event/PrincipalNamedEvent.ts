import {Principal} from 'lib-admin-ui/security/Principal';
import {Event} from 'lib-admin-ui/event/Event';
import {WizardPanel} from 'lib-admin-ui/app/wizard/WizardPanel';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';

export class PrincipalNamedEvent
    extends Event {

    private wizard: WizardPanel<Principal>;
    private principal: Principal;

    constructor(wizard: WizardPanel<Principal>, principal: Principal) {
        super();
        this.wizard = wizard;
        this.principal = principal;
    }

    public getWizard(): WizardPanel<Principal> {
        return this.wizard;
    }

    public getPrincipal(): Principal {
        return this.principal;
    }

    static on(handler: (event: PrincipalNamedEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: PrincipalNamedEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }

}

