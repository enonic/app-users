import {SecurityInputTypeViewContext} from './SecurityInputTypeViewContext';
import {IdProvider} from '../principal/IdProvider';

export class SecurityFormContext
    extends api.form.FormContext {

    private userStore: IdProvider;

    constructor(builder: SecurityFormContextBuilder) {
        super(builder);
        this.userStore = builder.userStore;
    }

    getUserStore(): IdProvider {
        return this.userStore;
    }

    createInputTypeViewContext(inputTypeConfig: any, parentPropertyPath: api.data.PropertyPath,
                               input: api.form.Input): api.form.inputtype.InputTypeViewContext {

        return <SecurityInputTypeViewContext> {
            formContext: this,
            input: input,
            inputConfig: inputTypeConfig,
            parentDataPath: parentPropertyPath,
            contentPath: this.getContentPath(),
        };
    }

    private getContentPath(): api.content.ContentPath {
        return new api.content.ContentPath([this.userStore.getKey().toString()]);
    }

    static create(): SecurityFormContextBuilder {
        return new SecurityFormContextBuilder();
    }

}

export class SecurityFormContextBuilder
    extends api.form.FormContextBuilder {

    userStore: IdProvider;

    setUserStore(value: IdProvider): SecurityFormContextBuilder {
        this.userStore = value;
        return this;
    }

    public build(): SecurityFormContext {
        return new SecurityFormContext(this);
    }
}
