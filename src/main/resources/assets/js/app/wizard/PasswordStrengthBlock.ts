import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import * as owasp from 'owasp-password-strength-test';

export class PasswordStrengthBlock extends DivEl {

    private static BLOCKS_COUNT: number = 5;

    constructor() {
        super('password-complexity');
    }

    public setTestResult(testResult: owasp.TestResult): void {
      if (testResult.errors.length > 0) {
          this.setTitle(testResult.errors[0]);
      } else {
          this.setTitle('');
      }
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            for (let i = 0; i < PasswordStrengthBlock.BLOCKS_COUNT; i++) {
                const errorBlock: SpanEl = new SpanEl('error-block');
                this.appendChild(errorBlock);
            }

            return rendered;
        });
    }
}
