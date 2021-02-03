import {FormInputEl} from 'lib-admin-ui/dom/FormInputEl';
import {Element} from 'lib-admin-ui/dom/Element';
import {AEl} from 'lib-admin-ui/dom/AEl';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {i18n} from 'lib-admin-ui/util/Messages';
import {nanoid} from 'nanoid';
import {InputEl} from 'lib-admin-ui/dom/InputEl';
import * as owasp from 'owasp-password-strength-test';
import {PasswordStrengthBlock} from './PasswordStrengthBlock';
import {StringHelper} from 'lib-admin-ui/util/StringHelper';

export enum PasswordStrength {
    GOOD = 'good',
    ALMOST_GOOD = 'almostgood',
    NOT_GOOD = 'notgood',
    BAD = 'bad',
    VERY_BAD = 'verybad'
}

export class PasswordGenerator
    extends FormInputEl {

    private input: InputEl;
    private showLink: AEl;
    private generateLink: AEl;
    private passwordStrengthBlock: PasswordStrengthBlock;
    private passwordStrength: PasswordStrength;

    private focusListeners: { (event: FocusEvent): void }[] = [];
    private blurListeners: { (event: FocusEvent): void }[] = [];

    constructor() {
        super('div', 'password-generator');

        this.initElements();
        this.initListeners();
    }

    private initElements() {
        this.input = new InputEl('password-input');
        this.passwordStrengthBlock = new PasswordStrengthBlock();
        this.showLink = new AEl('show-link');
        this.toggleShowLink(true);
        this.generateLink = new AEl('generate-link');
        this.generateLink.setHtml(i18n('field.pswGenerator.generate'));
    }

    private initListeners() {
        this.initFocusEvents(this.input);

        this.input.onInput(() => {
            this.assessComplexity(this.input.getValue());
            this.notifyValidityChanged(this.input.isValid());
        });

        this.initFocusEvents(this.showLink);

        this.showLink.onClicked((event: MouseEvent) => {
            this.toggleClass('unlocked');

            const unlocked = this.hasClass('unlocked');

            this.toggleShowLink(!unlocked);
            this.input.setType(unlocked ? 'text' : 'password');

            event.stopPropagation();
            event.preventDefault();
            return false;
        });

        this.initFocusEvents(this.generateLink);

        this.generateLink.onClicked((event: MouseEvent) => {
            this.generatePassword();
            this.assessComplexity(this.input.getValue());
            this.notifyValidityChanged(this.input.isValid());
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    setValue(value: string, silent?: boolean, userInput?: boolean): PasswordGenerator {
        return this.doSetValue(value, silent, userInput);
    }

    doGetValue(): string {
        return this.input.getValue();
    }

    doSetValue(value: string, silent?: boolean, userInput?: boolean): PasswordGenerator {
        this.input.setValue(value, silent, userInput);
        this.assessComplexity(value);
        return this;
    }

    getName(): string {
        return this.input.getName();
    }

    setName(value: string): PasswordGenerator {
        this.input.setName(value);
        return this;
    }

    private toggleShowLink(locked: boolean) {
        this.showLink.getEl().setAttribute('data-i18n', i18n(`field.pswGenerator.${locked ? 'show' : 'hide'}`));
    }

    reset() {
        this.setValue('');
        this.toggleShowLink(true);
    }

    private assessComplexity(value: string) {
        if (this.passwordStrength) {
            this.removeClass(this.passwordStrength);
            this.passwordStrength = null;
        }

        if (StringHelper.isEmpty(value)) {
            this.getEl().removeAttribute('data-i18n');
            return;
        }

        const testResult: owasp.TestResult = owasp.test(value);
        this.passwordStrengthBlock.setTestResult(testResult);

        this.passwordStrength = this.getPasswordStrength(testResult);
        this.getEl().setAttribute('data-i18n', i18n(`field.pswGenerator.complexity.${this.passwordStrength}`));
        this.addClass(this.passwordStrength);
    }

    private getPasswordStrength(testResult: owasp.TestResult): PasswordStrength {
        if (testResult.errors.length === 0) {
            return PasswordStrength.GOOD;
        }

        if (testResult.errors.length === 1) {
            return PasswordStrength.ALMOST_GOOD;
        }

        if (testResult.errors.length === 2) {
            return PasswordStrength.NOT_GOOD;
        }

        if (testResult.errors.length === 3) {
            return PasswordStrength.BAD;
        }

        return PasswordStrength.VERY_BAD;
    }

    private generatePassword() {
        this.input.setValue(nanoid());
    }

    isValid(): boolean {
        return !!this.getValue() && this.getValue().length > 0 && this.input.isValid() && this.passwordStrength === PasswordStrength.GOOD;
    }

    private initFocusEvents(el: Element) {
        el.onFocus((event: FocusEvent) => {
            this.notifyFocused(event);
        });

        el.onBlur((event: FocusEvent) => {
            this.notifyBlurred(event);
        });
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            const inputWrapper = new DivEl('input-wrapper');
            this.appendChild(inputWrapper);
            inputWrapper.appendChild(this.input);

            const toolbarWrapper = new DivEl('toolbar-wrapper');
            toolbarWrapper.appendChildren(this.showLink, this.generateLink);
            toolbarWrapper.appendChild(this.passwordStrengthBlock);
            this.appendChild(toolbarWrapper);

            return rendered;
        });
    }

    onInput(listener: (event: Event) => void) {
        this.input.onInput(listener);
    }

    unInput(listener: (event: Event) => void) {
        this.input.unInput(listener);
    }

    onFocus(listener: (event: FocusEvent) => void) {
        this.focusListeners.push(listener);
    }

    unFocus(listener: (event: FocusEvent) => void) {
        this.focusListeners = this.focusListeners.filter((curr) => {
            return curr !== listener;
        });
    }

    onBlur(listener: (event: FocusEvent) => void) {
        this.blurListeners.push(listener);
    }

    unBlur(listener: (event: FocusEvent) => void) {
        this.blurListeners = this.blurListeners.filter((curr) => {
            return curr !== listener;
        });
    }

    private notifyFocused(event: FocusEvent) {
        this.focusListeners.forEach((listener) => {
            listener(event);
        });
    }

    private notifyBlurred(event: FocusEvent) {
        this.blurListeners.forEach((listener) => {
            listener(event);
        });
    }

}
