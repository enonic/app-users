import {SecurityInputTypeViewContext} from './SecurityInputTypeViewContext';
import {IdProvider} from '../principal/IdProvider';

export class SecurityFormContext
    extends api.form.FormContext {

    private idProvider: IdProvider;

    constructor(builder: SecurityFormContextBuilder) {
        super(builder);
        this.idProvider = builder.idProvider;
    }

    getIdProvider(): IdProvider {
        return this.idProvider;
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
        return new api.content.ContentPath([this.idProvider.getKey().toString()]);
    }

    static create(): SecurityFormContextBuilder {
        return new SecurityFormContextBuilder();
    }

}

export class SecurityFormContextBuilder
    extends api.form.FormContextBuilder {

    idProvider: IdProvider;

    setIdProvider(value: IdProvider): SecurityFormContextBuilder {
        this.idProvider = value;
        return this;
    }

    public build(): SecurityFormContext {
        return new SecurityFormContext(this);
    }
}
