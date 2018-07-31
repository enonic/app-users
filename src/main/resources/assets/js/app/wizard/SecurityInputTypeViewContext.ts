import InputTypeViewContext = api.form.inputtype.InputTypeViewContext;
import ContentPath = api.content.ContentPath;
import {SecurityFormContext} from './SecurityFormContext';

export interface SecurityInputTypeViewContext
    extends InputTypeViewContext {

    formContext: SecurityFormContext;

    contentPath: ContentPath;
}
