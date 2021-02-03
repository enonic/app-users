import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {SpanEl} from 'lib-admin-ui/dom/SpanEl';
import * as owasp from 'owasp-password-strength-test';

export class PasswordStrengthBlock extends DivEl {

    private errorBlocks: SpanEl[] = [];

    private testResult: owasp.TestResult;

    constructor() {
        super('password-complexity');
    }

    public setTestResult(testResult: owasp.TestResult) {
        this.testResult = testResult;
        this.evaluate();
    }

    private evaluate() {
        this.errorBlocks.forEach((errorBlock: SpanEl) => this.removeChild(errorBlock));
        this.errorBlocks = [];

        this.testResult.errors.forEach((error: string) => {
            const errorBlock: SpanEl = new SpanEl('error-block');
            errorBlock.setTitle(error);
            this.errorBlocks.push(errorBlock);
            this.appendChild(errorBlock);
        });
    }
}
