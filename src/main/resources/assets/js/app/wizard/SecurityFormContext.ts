import {SecurityInputTypeViewContext} from './SecurityInputTypeViewContext';
import {IdProvider} from '../principal/IdProvider';
import {FormContext, FormContextBuilder} from 'lib-admin-ui/form/FormContext';
import {PropertyPath} from 'lib-admin-ui/data/PropertyPath';
import {Input} from 'lib-admin-ui/form/Input';
import {InputTypeViewContext} from 'lib-admin-ui/form/inputtype/InputTypeViewContext';

export class SecurityFormContext
    extends FormContext {

    private idProvider: IdProvider;

    constructor(builder: SecurityFormContextBuilder) {
        super(builder);
        this.idProvider = builder.idProvider;
    }

    setIdProvider(value: IdProvider) {
        this.idProvider = value;
    }

    getIdProvider(): IdProvider {
        return this.idProvider;
    }

    createInputTypeViewContext(inputTypeConfig: any, parentPropertyPath: PropertyPath,
                               input: Input): InputTypeViewContext {

        return <SecurityInputTypeViewContext> {
            formContext: this,
            input: input,
            inputConfig: inputTypeConfig,
            parentDataPath: parentPropertyPath
        };
    }

    static create(): SecurityFormContextBuilder {
        return new SecurityFormContextBuilder();
    }

}

export class SecurityFormContextBuilder
    extends FormContextBuilder {

    idProvider: IdProvider;

    setIdProvider(value: IdProvider): SecurityFormContextBuilder {
        this.idProvider = value;
        return this;
    }

    public build(): SecurityFormContext {
        return new SecurityFormContext(this);
    }
}
