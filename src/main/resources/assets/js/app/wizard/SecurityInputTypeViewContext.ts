import {InputTypeViewContext} from 'lib-admin-ui/form/inputtype/InputTypeViewContext';
import {SecurityFormContext} from './SecurityFormContext';

export interface SecurityInputTypeViewContext
    extends InputTypeViewContext {

    formContext: SecurityFormContext;
}
