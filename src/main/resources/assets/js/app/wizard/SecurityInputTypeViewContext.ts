import {InputTypeViewContext} from 'lib-admin-ui/form/inputtype/InputTypeViewContext';
import {ContentPath} from 'lib-admin-ui/content/ContentPath';
import {SecurityFormContext} from './SecurityFormContext';

export interface SecurityInputTypeViewContext
    extends InputTypeViewContext {

    formContext: SecurityFormContext;

    contentPath: ContentPath;
}
